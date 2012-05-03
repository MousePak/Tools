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

setup.py

Sets up the initial database structure

"""

import config,database,os,sys


# Output warning and continue prompt
print "This script will replace any existing database at the location in config."
print "Make sure you have set up your config file correctly before running this script."
r = None
while r not in ('n','N','y','Y'):
    r = raw_input("Continue? (y/n) ")
    if r in ('n','N'):
        print "Exiting..."
        sys.exit()

# Prevent conflicts by removing any existing database
try:
    os.remove(config.DB)
except OSError:
    pass

# Get a connection to the database
cursor = database.get_db(new = True)

# Create settings and filters tables
cursor.execute('''
create table settings (
    name text not null,
    value text not null,
    unique (name)
)''')
cursor.execute('''
create table filters (
    search text not null,
    out text not null
)''')
cursor.execute('''
create table claims (
    x int not null,
    y int not null,
    playername int not null,
    timestamp int not null
)''')

# Create boss request cooldown table
cursor.execute('''
create table boss_cooldown (
player text not null,
time integer not null,
unique (player)
)''')

# Populate settings
good = False
settings = {'server':None,
            'username': None,
            'email': None,
            'password': None}

while not good:
    settings['server'] = "http://prodgame01.lordofultima.com/%s/"%raw_input("Server (e.g. 35 for world 23): ")
    settings['username'] = raw_input("Bot's username: ")
    settings['email'] = raw_input("LoU login email: ")
    settings['password'] = raw_input("LoU password: ")

    for setting in settings:
        print setting.capitalize() + ': ' + settings[setting]
        
    ans = raw_input("Is that correct? [Y/n]").strip().lower()
    good = True
    if ans and ans[0] == 'n':
        good = False
        
for setting in settings:
    cursor.execute('insert into settings (name, value) values (?, ?)', (setting.upper(), settings[setting]))

print "Database created."

database.commit()
cursor.close()
