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

# Check if table exists
pg_cursor.execute("""
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'credit_cards'
    )
""")
table_exists = pg_cursor.fetchone()[0]
print(f"Table exists: {table_exists}")

if table_exists:
    pg_cursor.execute("SELECT COUNT(*) FROM credit_cards")
    count = pg_cursor.fetchone()[0]
    print(f"Total credit cards: {count}")
    
    if count > 0:
        pg_cursor.execute("SELECT id, name, bank, status FROM credit_cards LIMIT 5")
        cards = pg_cursor.fetchall()
        print("\nSample cards:")
        for card in cards:
            print(f"  ID: {card[0]}, Name: {card[1]}, Bank: {card[2]}, Status: {card[3]}")
else:
    print("Table does not exist. Creating table...")
    pg_cursor.execute("""
        CREATE TABLE IF NOT EXISTS credit_cards (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            bank VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            annual_fee DECIMAL(10,2) DEFAULT 0,
            joining_fee DECIMAL(10,2) DEFAULT 0,
            dsa_commission DECIMAL(10,2) DEFAULT 0,
            reward_points TEXT,
            redirect_url TEXT,
            payout_source VARCHAR(255),
            variant_image TEXT,
            card_image TEXT,
            pincodes TEXT,
            terms TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    pg_conn.commit()
    print("Table created successfully")

pg_cursor.close()
pg_conn.close()
