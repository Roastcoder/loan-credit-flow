import mysql.connector
import psycopg2
from urllib.parse import unquote

# MySQL connection
mysql_conn = mysql.connector.connect(
    host='72.61.238.231',
    port=5437,
    user='leadmanagementadmin',
    password=unquote('sparshjain%4028'),
    database='leadmanagement'
)

# PostgreSQL connection
pg_conn = psycopg2.connect(
    host='72.61.238.231',
    port=3000,
    user='Board',
    password=unquote('Sanam%4028'),
    database='board'
)

mysql_cursor = mysql_conn.cursor(dictionary=True)
pg_cursor = pg_conn.cursor()

# Fetch all credit cards from MySQL products table
mysql_cursor.execute("SELECT * FROM products WHERE category = 'Credit Card'")
credit_cards = mysql_cursor.fetchall()

print(f"Found {len(credit_cards)} credit cards to migrate")

# Insert into PostgreSQL
for card in credit_cards:
    pg_cursor.execute("""
        INSERT INTO credit_cards (name, bank, type, annual_fee, joining_fee, dsa_commission, 
                                  reward_points, redirect_url, payout_source, variant_image, 
                                  card_image, pincodes, terms, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (
        card.get('name'),
        card.get('variant', ''),
        card.get('category'),
        0,
        0,
        card.get('commission_rate', 0),
        card.get('product_highlights'),
        card.get('bank_redirect_url'),
        card.get('payout_source'),
        card.get('variant_image'),
        card.get('card_image'),
        card.get('pin_codes'),
        card.get('terms_content'),
        card.get('status', 'active'),
        card.get('created_at')
    ))

pg_conn.commit()
print(f"Successfully migrated {len(credit_cards)} credit cards")

mysql_cursor.close()
pg_cursor.close()
mysql_conn.close()
pg_conn.close()
