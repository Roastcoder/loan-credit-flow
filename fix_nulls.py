import psycopg2
from urllib.parse import unquote

pg_conn = psycopg2.connect(
    host='72.61.238.231',
    port=3000,
    user='Board',
    password=unquote('Sanam%4028'),
    database='board'
)

pg_cursor = pg_conn.cursor()

# Update NULL values to defaults
pg_cursor.execute("""
    UPDATE credit_cards 
    SET 
        annual_fee = COALESCE(annual_fee, 0),
        joining_fee = COALESCE(joining_fee, 0),
        dsa_commission = COALESCE(dsa_commission, 0),
        bank = COALESCE(bank, ''),
        type = COALESCE(type, ''),
        reward_points = COALESCE(reward_points, ''),
        redirect_url = COALESCE(redirect_url, ''),
        payout_source = COALESCE(payout_source, ''),
        variant_image = COALESCE(variant_image, ''),
        card_image = COALESCE(card_image, ''),
        pincodes = COALESCE(pincodes, ''),
        terms = COALESCE(terms, ''),
        status = COALESCE(status, 'active')
""")

pg_conn.commit()
print(f"Updated {pg_cursor.rowcount} rows")

pg_cursor.close()
pg_conn.close()
