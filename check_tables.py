import mysql.connector
from urllib.parse import unquote

# MySQL connection
mysql_conn = mysql.connector.connect(
    host='72.61.238.231',
    port=5437,
    user='leadmanagementadmin',
    password=unquote('sparshjain%4028'),
    database='leadmanagement'
)

mysql_cursor = mysql_conn.cursor()

# Show all tables
mysql_cursor.execute("SHOW TABLES")
tables = mysql_cursor.fetchall()

print("Available tables in leadmanagement database:")
for table in tables:
    print(f"  - {table[0]}")
    
    # Show table structure
    mysql_cursor.execute(f"DESCRIBE {table[0]}")
    columns = mysql_cursor.fetchall()
    print(f"    Columns: {', '.join([col[0] for col in columns])}")
    
    # Count rows
    mysql_cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
    count = mysql_cursor.fetchone()[0]
    print(f"    Rows: {count}\n")

mysql_cursor.close()
mysql_conn.close()
