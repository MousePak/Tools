#!/usr/bin/env python
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

run.py

Runs/manages the bot

"""

import bot, config, database, getopt, sys, time

def usage():
    print "Usage: ./run.py <action> [options]"
    print "  -r,\t--run\t\t  Starts the bot."
    print "  -a,\t--add\t\t  Adds a filter to the filters. Needs -s and -o."
    print "  -f,\t--filter\t  Search for a specific filter. Requires -s or -o."
    print "  -s,\t--search=SEARCH\t  The substring to search for - % = wildcard."
    print "  -o,\t--output=OUTPUT\t  The bot's response to a search."
    print "  -m,\t--message=MESSAGE Send a message manually through the bot."
    print "  -d,\t--delete=ID\t  Delete a filter by it's ID."
    print "----------------------------------------------------------------------------"
    print "Comments? Feedback? Email adam@lou-tools.com"
    print "For full documentation see http://bot.lou-tools.com"
    print "----------------------------------------------------------------------------"
    print "Todo for future versions:"
    print " - Make search & delete easier to use."

def fsearch(search=None, output=None):
    results = database.search_filters(search,output)
    if not results:
        print "No filters found with that search/output combination."
    else:
        for r in results:
            print str(r[0]) + ': ' + str(r[1]) + '\nResponse: ' + str(r[2]) + '\n'

def delete(rowid):
    print "Warning: you are deleting filter with ID " + rowid + "."
    r = None
    while r not in ('n','N','y','Y'):
        r = raw_input("Continue? (y/n) ")
        if r in ('n','N'):
            print "Exiting..."
            sys.exit()
    database.del_filter(rowid)
    print "If that filter existed, it doesn't any more."
    sys.exit(0)

def main(argv):

    if not len(argv):
        usage()
        sys.exit(1)

    try:
        opts, args = getopt.getopt(argv, "m:o:s:d:raf", ["message=","output=","search=","delete=","run","add","filter"])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    add = False
    filters = False
    search = None
    output = None

    for o, a in opts:
        if o in ("-r", "--run"):
            runbot()
        if o in ("-m", "--message"):
            bot.output(a)
            print "Sent."
            sys.exit(0)
        if o in ("-mw", "--message"):
            bot.output(a,'C')
            print "Sent."
            sys.exit(0)
        if o in ("-s", "--search"):
            search = a
        if o in ("-o", "--output"):
            output = a
        if o in ("-a", "--add"):
            add = True
        if o in ("-f", "--filter"):
            filters = True
        if o in ("-d", "--delete"):
            delete(a)


    if add and search and output:
        database.add_filter(search,output)
        print "Filter added successfully."
    elif filters and (search or output):
        fsearch(search, output)
    else:
        usage()

def runbot():
    print 'hbot [%s] starting up, master!'%database.get_setting('username')
    while 1:
        bot.check()
        time.sleep(config.SPEED)


if __name__ == '__main__':
    main(sys.argv[1:])
