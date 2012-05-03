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

connect.py

Provides functions for accessing/connecting to the LoU game API

"""

import config, json, random, urllib, urllib2
import database as db
import world
import base91 as b91

# Retrieves the session from the database, optionally testing it
def get_session(test=False):

    # Get stored session from DB
    session = db.get_setting('session')

    # Test session if required
    # If test fails or no session is found, generate a new one
    if test:
        session = test_session()

    if not session:
        session = new_session()

    return session

# Tests the stored session
def test_session():

    # Make test poll
    test = poll(("PLAYER:",))

    # If player data wasn't returned, then session is invalid
    try:
        if not test[1]['C'] == u'PLAYER':
            session = None
        else:
            session = get_session(test=False) # no recursion =)
        return session
    except TypeError:
        return None

# Generates a new session ID
def new_session():
    print "Connecting new session."
    # Build opener with cookies
    o = urllib2.build_opener(urllib2.HTTPCookieProcessor())
    urllib2.install_opener(o)

    # Encode data
    data = urllib.urlencode({'mail':db.get_setting('email'), 'password':db.get_setting('password')})

    # Do the login...
    r = o.open('https://www.lordofultima.com/en/user/login', data)
    response = r.read()
    r.close()

    # Extract session ID
    s = response.find('Id" value="')
    p = s + 11
    sess = response[p:p+36]

    # Generate session key from session ID
    key = get("OpenSession",{'session':sess,'reset':'false'})
    key = key['i']

    # Save session key to database
    db.set_setting('session',key)

    # Connect session to continent chat
    poll(("CHAT:/c 11",))

    return key


# Retrieves data from a specified endpoint
def get(endpoint,data):

    # Define URL
    url = db.get_setting('server') + "Presentation/Service.svc/ajaxEndpoint/" + endpoint

    # Encode data
    data = json.dumps(data)

    # Replace ## with \f (because I can't get it escaped beforehand for some odd reason)
    data = data.replace('##',r'\f')
    
    # Add URL + data to request
    r = urllib2.Request(url,data)

    # Add extra headers
    r.add_header('Content-Type', 'application/json')
    r.add_header('X-Qooxdoo-Reponse-Type', 'application/json')
    r.add_header('Referer', db.get_setting('server') + 'index.aspx')

    # Make request, decode and return
    try:
        r = urllib2.urlopen(r)
        d = json.loads(r.read())
    except ValueError:
        d = None
    except urllib2.URLError as e:
        d = None
        print 'URL Error', e
        if 'HTTP Error 503' in e:
            print 'pausing for 10 seconds....'
            import time
            time.sleep(10)


    return d

# Runs a poll request
def poll(requests,test=False):

    # Load requests into string
    reqs = ""
    for r in requests:
        reqs += (r + '##')

    # Set up data
    data = {
        'session': get_session(test),
        'requestid': 10000,#random.randint(0,100),
        'requests': reqs
    }

    # Return result of poll
    return get('Poll', data)

def getWorldInfo(cells):
    '''Returns world visibility information.
    cells - A list of cells to get information for, e.g. [1,2,3,40]
    '''
    cells = map(world.enc_cell, cells)
    cell_str = '-'.join(cells)

    return get('Poll', {'session':get_session(), 'requestid':10000, 'requests':'WORLD:' + cell_str + '-\f'})

def getAllianceInfo(aarg):
    '''Returns GetPublicAllianceMemberList information.
    {"session":"5xxx-xxx-xxx","id":19}
    '''

    return get('GetPublicAllianceMemberList', {'session':get_session(), 'id':aarg})
