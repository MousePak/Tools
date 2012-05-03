"""

LoU Bot - A chatbot for LoU
Copyright (c) 2011 Adam Tonks (obsessive1)

--

LoU Bot is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

LoU Bot is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with LoU Bot.  If not, see <http://www.gnu.org/licenses/>.

---

database.py

Provides functions for communicating with the database

"""
from time import time
import config, sqlite3
import os
import sys

try:
    con
except NameError:
    con = None

# Returns db cursor
def get_db(new = False):
    global con
    if not con:
        if not new and not os.path.exists(config.DB):
            print "ERROR: I can't find the database.  Please run setup.py."
            sys.exit(1)

        con = sqlite3.connect(config.DB)
    return con.cursor()

# Commits changes
def commit():
    global con
    return con.commit()

# Gets the value of one of the settings
def get_setting(name):
    name = name.upper()
    c = get_db()
    d = c.execute('select value from settings where name=?',(name,))
    value = None
    for r in d:
        value = r[0]
    c.close()
    return value

# Create a setting if it doesn't exist, and if it does just update it
def set_setting(name,value):
    name = name.upper()
    c = get_db()
    if not get_setting(name):
        c.execute('insert into settings (name,value) values (?,?)',(name,value,))
    else:
        c.execute('update settings set value=? where name=?',(value,name,))
    commit()
    c.close()
    return True

# Check a claim
def check_claim(x,y):
    c = get_db()
    d = c.execute('select playername from claims where x=? and y=? and timestamp>?',(x,y,int(time())-config.CLAIMS_EXPIRY*3600,))
    p = None
    for r in d:
        p = r[0]
    return p

# Add a claim to the database (returns false if already exists)
def add_claim(x,y,pName):
    c = get_db()
    if not check_claim(x,y):
        c.execute('insert into claims (x,y,playername,timestamp) values (?,?,?,?)',(x,y,pName,int(time()),))
        commit()
        c.close()
        return True
    else: return False


# Remove a setting
def del_setting(name):
    c = get_db()
    if not get_setting(name):
        return False
    c.execute('delete from settings where name=?',(name,))
    return True

# Add a filter
def add_filter(search,output):
    c = get_db()
    c.execute('insert into filters (search,out) values (?,?)',(search,output))
    commit()
    c.close()
    return True

# Search for a filter
def search_filters(search=None,output=None):
    c = get_db()
    if not output:
        c.execute("select rowid,search,out from filters where search like '%' || ? || '%'",(search,))
    elif not search:
        c.execute("select rowid,search,out from filters where out like '%' || ? || '%'",(output,))
    else:
        c.execute("select rowid,search,out from filters where search like '%' || ? || '%' and out like '%' || ? || '%'",(search,output))
    return c

# Remove a filter by rowid
def del_filter(rowid):
    c = get_db()
    c.execute("delete from filters where rowid=?",(rowid,))
    commit()
    c.close()
    return True
