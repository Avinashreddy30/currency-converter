from flask import Flask, render_template, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# Use environment variable for API key or fallback to provided key
API_KEY = os.getenv("EXCHANGERATE_API_KEY", "b96e903c4562722c74ee1450")
BASE_URL = "https://v6.exchangerate-api.com/v6"
FALLBACK_URL = "https://api.exchangerate-api.com/v4/latest"

def get_exchange_rates(base_currency="USD"):
    """Get exchange rates from API"""
    try:
        # Try with API key first
        if API_KEY and API_KEY != "your_api_key_here":
            url = f"{BASE_URL}/{API_KEY}/latest/{base_currency}"
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('result') == 'success':
                    return {
                        'base': base_currency,
                        'rates': data.get('conversion_rates', {})
                    }
        
        # Fallback to free API
        url = f"{FALLBACK_URL}/{base_currency}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
            
    except Exception as e:
        print(f"Error fetching rates: {e}")
    
    # Return mock data if API fails
    return {
        "base": base_currency,
        "rates": {
            "USD": 1.0, "EUR": 0.85, "GBP": 0.73, "JPY": 110.0,
            "AUD": 1.35, "CAD": 1.25, "CHF": 0.92, "CNY": 6.45,
            "INR": 74.5, "KRW": 1180.0, "MXN": 20.5, "SGD": 1.35,
            "BRL": 5.2, "RUB": 75.0, "ZAR": 14.5
        }
    }

def get_supported_currencies():
    """Get list of supported currencies"""
    return {
        "USD": "US Dollar",
        "EUR": "Euro",
        "GBP": "British Pound",
        "JPY": "Japanese Yen",
        "AUD": "Australian Dollar",
        "CAD": "Canadian Dollar",
        "CHF": "Swiss Franc",
        "CNY": "Chinese Yuan",
        "INR": "Indian Rupee",
        "KRW": "South Korean Won",
        "MXN": "Mexican Peso",
        "SGD": "Singapore Dollar",
        "BRL": "Brazilian Real",
        "RUB": "Russian Ruble",
        "ZAR": "South African Rand"
    }

@app.route('/')
def index():
    currencies = get_supported_currencies()
    return render_template('index.html', currencies=currencies)

@app.route('/convert', methods=['POST'])
def convert():
    try:
        data = request.get_json()
        from_currency = data.get('from_currency', 'USD')
        to_currency = data.get('to_currency', 'EUR')
        amount = float(data.get('amount', 0))
        
        # Get exchange rates
        rates_data = get_exchange_rates(from_currency)
        
        if 'rates' in rates_data and to_currency in rates_data['rates']:
            rate = rates_data['rates'][to_currency]
            converted_amount = amount * rate
            
            return jsonify({
                'success': True,
                'converted_amount': round(converted_amount, 2),
                'rate': round(rate, 4),
                'from_currency': from_currency,
                'to_currency': to_currency
            })
        else:
            return jsonify({'success': False, 'error': 'Currency not supported'})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/rates/<currency>')
def get_rates(currency):
    """Get current rates for a specific currency"""
    try:
        rates_data = get_exchange_rates(currency.upper())
        return jsonify(rates_data)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)