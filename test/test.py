import json
import os

# Put all your json files in a folder named 'test'
# Make sure this folder exists and contains your .json files
folder_path = 'test'

def check_bill_accuracy(filepath):
    model_name = os.path.basename(filepath).replace('.json', '')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return {
                    "Model": model_name,
                    "Items Found": 0,
                    "JSON Total": "N/A",
                    "Calc Sum": "N/A",
                    "Status": "❌ ERROR: Empty File"
                }
            data = json.loads(content)
    except json.JSONDecodeError:
        return {
            "Model": model_name,
            "Items Found": 0,
            "JSON Total": "N/A",
            "Calc Sum": "N/A",
            "Status": "❌ ERROR: Invalid JSON Format"
        }
    except Exception as e:
        return {
            "Model": model_name,
            "Items Found": 0,
            "JSON Total": "N/A",
            "Calc Sum": "N/A",
            "Status": f"❌ ERROR: {str(e)}"
        }

    # 1. Extract Net Total from the summary section
    net_total = 0
    try:
        # Check various common keys for the total
        summary_section = data.get('summary') or data.get('totals') or data.get('invoice_details') or {}
        
        # Look for total keys in that section
        raw_total = (
            summary_section.get('net_total') or 
            summary_section.get('Net Total') or 
            summary_section.get('total_amount') or
            data.get('total_amount') # Sometimes it's at the root
        )

        # Clean string to float if needed (remove commas)
        if isinstance(raw_total, (str, int, float)):
             net_total = float(str(raw_total).replace(',', ''))
    except Exception:
        net_total = 0

    # 2. Sum up all line items
    calculated_sum = 0
    item_count = 0
    
    if 'line_items' in data and isinstance(data['line_items'], list):
        item_count = len(data['line_items'])
        for item in data['line_items']:
            # Try to get total_amount, handle strings/floats
            amt = item.get('total_amount') or item.get('Total_Amt') or item.get('total_price') or 0
            try:
                if isinstance(amt, str):
                    amt = float(amt.replace(',', ''))
                calculated_sum += float(amt)
            except ValueError:
                pass # Skip items with bad number formats

    # 3. Calculate Discrepancy
    # Note: If Net Total is 0 (not found), we just show the Calc Sum
    if net_total == 0:
        diff = 0 # Cannot compare
        status_msg = "⚠️ Total Not Found"
    else:
        diff = abs(net_total - calculated_sum)
        # We allow a larger margin (e.g., 50.0) because some models exclude tax from line items but include it in net total
        status_msg = "✅ PASS" if diff < 50.0 else f"❌ FAIL (Diff: {diff:,.2f})"

    # Lazy check override
    if item_count < 5: 
        status_msg = "❌ FAIL (Lazy/Low Item Count)"

    return {
        "Model": model_name,
        "Items Found": item_count,
        "JSON Total": f"{net_total:,.2f}",
        "Calc Sum": f"{calculated_sum:,.2f}",
        "Status": status_msg
    }

# --- Main Execution ---

results = []

# Check if folder exists
if not os.path.exists(folder_path):
    print(f"Error: The folder '{folder_path}' does not exist.")
    print("Please create the folder and put your .json files inside it.")
else:
    # Iterate through files
    for file in os.listdir(folder_path):
        if file.endswith('.json'):
            full_path = os.path.join(folder_path, file)
            results.append(check_bill_accuracy(full_path))

    # Sort results by status (Failures at the bottom or top as you prefer)
    results.sort(key=lambda x: x['Model'])

    # Print Table Header
    print(f"\n{'Model':<15} | {'Items':<5} | {'JSON Total':<12} | {'Calc Sum':<12} | {'Status'}")
    print("-" * 75)

    # Print Rows
    for r in results:
        print(f"{r['Model']:<15} | {r['Items Found']:<5} | {r['JSON Total']:<12} | {r['Calc Sum']:<12} | {r['Status']}")