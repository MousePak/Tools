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

bot.py

Functions to do the actual bot stuff

"""

import connect, database, filters

# Processes a message
def process(raw):

    # Check the message is from the right chat channel
    if raw['c'] == '@A' or raw['c'] == 'privatein' or (raw['c'] == '@C' and raw['m'].strip()[0] == '!') or (raw['c'] == '@C' and 'botx' in raw['m'].lower()) or (raw['c'] == '@C' and 'random' in raw['m'].lower()):

        # Save sender name if whispering
        database.set_setting('lastwhisper',raw['s'][1:])

        # Filter out the text and the sender
        text = raw['m']
        sender = raw['s'][1:]

        # Run through filters file
        filters.process(text,sender,raw['c'][1:])

        # Query the database for any matching filters
        db = database.get_db()
        r = db.execute("select * from filters where ? like search",(text,))

        # Loop through results
        for out in r:

            # Replace sender and arg with correct values
            out = out[1].replace('{{sender}}', sender)
            try:
                out = out.replace('{{arg}}', text.split(' ',1)[1])
            except IndexError:
                pass
            output(out,raw['c'][1:])


    return True

# Outputs given message to alliance chat
def output(message,chatroom='A'):
    print('said --> [%s] %s'%(chatroom, message))

    text = "CHAT:"
    if chatroom == 'C':
        text += message
    elif 'rivatein' in chatroom:
        text += '/w ' + database.get_setting('lastwhisper') + ' ' + message
    else:
        text += "/a " + message

    connect.poll((text,),True)
    return True

def whisper(message, target = None):
    if not target:
        target = database.get_setting('lastwhisper')

    print 'whispered ---> [' + target + ']' + message

    return connect.poll(("CHAT:/w " + target + ' ' + message,),True)
    

# Checks for any new messages
def check():
    r = connect.poll(("CHAT:",),True)
    try:
        r[1]
    except (IndexError, TypeError):
        return False

    types = {'@C': '[C]',
             'privatein': '[P]',
             '@A': '[A]'}

    for msg in r[1]['D']:
        try:
            print '[msg] %15s %s -- %s'%(msg['s'][1:], types.get(msg['c'],'[?]'), msg['m'])
        except TypeError:
            print 'Type Error:', msg

        process(msg)
        
    return True
