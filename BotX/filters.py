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

filters.py

A space to put any custom filters etc. This is an empty file, so it's licence is fairly redundant.

"""

import bot, database, random, re, os
import world
import connect
import time
import sys
import config

def process(text,sender,chatroom):

    userary = ['void1', 'void2']
    gods = ['mousepak','beobachten']

    # bosstry lvl boss unit
    if text.find('!boss') > -1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            bosstypes = {"d":0, "h":1, "m":2}
            suggested_troops = {"berserker":[0,1,0,50,300,2000,4000,10000,15000,20000,30000,45000,60000], "ranger":[0,1,0,84,500,3334,6667,16667,25000,33334,50000,75000,100000], "guardian":[0,1,0,250,1500,10000,20000,50000,75000,100000,150000,225000,300000], "xbow":[1,0,0,63,375,2500,5000,12500,18750,25000,37500,56250,75000], "knight":[1,0,0,28,167,1112,2223,5556,8334,11112,16667,25000,33334], "mage":[0,0,1,36,215,1429,2858,7143,10715,14286,21429,32143,42858], "warlock":[0,0,1,21,125,834,1667,4167,6250,8334,12500,18750,25000], "templar":[0,1,0,100,600,4000,8000,20000,30000,40000,60000,90000,120000], "paladin":[1,0,0,42,250,1667,3334,8334,12500,16667,25000,37500,50000]}
            research_bonus = [1, 0.99, 0.97, 0.94, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.5]
            try:
                tokens = text.split()
                cmd = tokens[0]
                type = tokens[1][:1]
                num = tokens[1][1:]
                unit = tokens[2]
                research_lvl = 0
                if len(tokens) == 4:
                    research_lvl = int(tokens[3])
                    if research_lvl > 12:
                        research_lvl = 12

#               print research_lvl
#               print len(tokens)

                troops = suggested_troops[unit][int(float(num))+2]
                if suggested_troops[unit][bosstypes[type]] == 1:
                    troops = suggested_troops[unit][int(float(num))+2]*0.67
                troops = troops * research_bonus[research_lvl]
                response = 'suggested troop numbers to send : '+str(int(round(troops, 0)))
                bot.whisper(response, sender)
            except (IndexError, ValueError, TypeError, KeyError):
                bot.whisper('try again: !boss {d|h|m}{1-10} type - type can be berserker, ranger, guardian, xbow, knight, mage, warlock, templar or paladin', sender)
                bot.whisper('e.g. !boss d7 knight', sender)
        return

    # quit
    if sender.lower() in gods and text.find('!die') >= 0:
        bot.whisper('Cya!', sender)
        sys.exit(0)

    # restart all bots
    if sender.lower() in gods and text.find('!restart') >= 0:
        bot.whisper('Attempting restart!', sender)
        os.system("pkill -f 'python run.py -r'")

    # help
    if text.find('!help') > -1 and len(text.split(' ',1)) == 1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        bot.output('/whisper '+sender+' Available commands.. !fight, !shoot, !tickle and !parp.','C')
        if p !=None:
            bot.output('/whisper '+sender+' Most commands whisper to remove chat spam. Type `help name` to find out more about the function `name`. Available commands.. help, boss, check, city, claim, hunt.','C')
            if sender in str(userary):
                bot.output('/whisper '+sender+' *Privileged commands.. history','C')
            if sender in str(gods):
                bot.output('/whisper '+sender+' *Master commands.. alliance, die, msg, whisper','C')
        return
    
    if text.find('!help') > -1 and len(text.split(' ',1)) > 1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            try:
                arg = text.split(' ',1)[1]
                if arg == 'boss':
                    bot.output('/whisper '+sender+' info about boss command.','C')
                elif arg == 'city':
                    bot.output('/whisper '+sender+' info about city command.','C')
                else:
                    bot.output('/whisper '+sender+' Not found','C')
            except ValueError:
                bot.output('/whisper '+sender+' something went wrong','C')
            except (Exception, e):
                print 'Something bad just happened!\n', e
        return

    # record alliance members to database table
    if sender.lower() in gods and text.find('!alliance') > -1 and chatroom == 'rivatein':
        alliance_data = connect.getAllianceInfo(7)
        db = database.get_db()
        db.execute('delete from alliance_names')
        db.execute('vacuum')

        for index, item in enumerate(alliance_data):
            rep = item['n']
            db.execute('insert or replace into alliance_names (player) values (?)',(rep,))

        database.commit()
        bot.whisper('Done', sender)
#       print(alliance_data)
        return


    # !history response
    if text.find('!history') > -1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            histname = text.split(' ',1)[1]
            lynxcmd = "lynx -source -auth=="+config.EXTUSER+":"+config.EXTPASS+" '"+config.EXTURL+"bot_lookup.php?world=39&player="+histname+"'"
            histdata = os.popen(lynxcmd).read()
            print(sender+' '+histdata)
            histdata2 = histdata.split('#')
            bot.output('/whisper '+sender+' '+histdata2[0],'C')
            bot.output('/whisper '+sender+' '+histdata2[1],'C')
            bot.output('/whisper '+sender+' '+histdata2[2],'C')
            bot.output('/whisper '+sender+' '+histdata2[3],'C')
        return


    # !city info response
    if text.find('!city') > -1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            print('room = '+chatroom)
            cityxy = text.split(' ',1)[1]
            cityxy = str(cityxy).replace("[coords]","")
            cityxy = cityxy.replace("[/coords]","")
            cityxy = cityxy.replace(" ","")
#            print(cityxy)
            cityx = cityxy.split(':')[0]
            cityy = cityxy.split(':')[1]
            lynxcmd = "lynx -source -auth="+config.EXTUSER+":"+config.EXTPASS+" '"+config.EXTURL+"bot_city.php?world=39&x="+cityx+"&y="+cityy+"'"
            citydata = os.popen(lynxcmd).read()
#            print(sender+' '+lynxcmd)
            print(sender+' '+citydata)
            citydata2 = citydata.split('#')
#            print(len(citydata2))
#            print(citydata2[0])
            for botout in range(0, len(citydata2)-1):
                bot.output('/whisper '+sender+' '+citydata2[botout],'C')
            else:
                bot.output('/whisper '+sender+' done','C')
        return


    # Make the bot speak
    if sender.lower() in gods and text.find('!msg') > -1:
        chandata = text.replace('!msg ','')
        bot.output(chandata,'C')
        return

    # Make the bot whisper
    if text.strip().find('!whisper') == 0 and sender.lower() in gods:
        tokens = text.split()
        cmd = tokens[0]
        target = tokens[1]
        message = ' '.join(tokens[2:])
        bot.whisper(message, target)
        return

    # add claim
    if text.find('!claim') > -1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            try:
                arg = text.split(' ',1)[1]
                xy = arg.split(':',1)
                x = str(xy[0]).replace("[coords]","")
                x = x.replace(" ","")
                y = str(xy[1]).replace("[/coords]","")
                if len(x) > 3 or len(y) > 3:
                    raise IndexError
                if database.check_claim(x,y):
                    bot.whisper('Location already claimed by ' + database.check_claim(x,y) + '. :(', sender)
                else:
                    database.add_claim(x,y,sender)
                    bot.whisper(x + ':' + y + ' successfully claimed!', sender)
            except IndexError:
                bot.whisper('Looks like you made a typo.', sender)
            return
        return

    # check claim
    if text.find('!check') > -1 and chatroom == 'rivatein':
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            try:
                arg = text.split(' ',1)[1]
                xy = arg.split(':',1)
                x = str(xy[0]).replace("[coords]","")
                x = x.replace(" ","")
                y = str(xy[1]).replace("[/coords]","")
                if len(x) > 3 or len(y) > 3:
                    raise IndexError
                if database.check_claim(x,y):
                    bot.whisper(x + ':' + y + ' is claimed by ' + database.check_claim(x,y) + '. :(', sender)
                else:
                    bot.whisper(x + ':' + y + ' is not claimed yet!', sender)
            except IndexError:
                bot.whisper('Looks like you made a typo.', sender)
            return
        return

    # Look for bosses, but only on whispers
    if '!hunt' in text and 'rivate' in chatroom:
        # check within alliance table
        db = database.get_db()
        d = db.execute('select player from alliance_names where player=?',(sender,))
        p = None
        for r in d:
           p = r[0]
        if p !=None:
            cooldown = 60 * 5
            x = None
            y = None
            cont = None
            lvl_max = 10
            lvl_min = 7
            
            # Let's not give some people an unfair advantage...
            if 'lekke' in sender.lower():
                bot.whisper('Sorry Lekke, you are too good to use me...', sender)
                return
                
            # First check that player isn't spamming this function be enforcing a cool down period
            now = int(time.time())
            db = database.get_db()
            resp = db.execute('select time from boss_cooldown where player = ?',(sender.lower(),))
            last_req = resp.fetchone()
            if last_req:
                last_req = int(last_req[0])
                elapsed = now - last_req
                if elapsed < cooldown:
                    if sender.lower() in gods:
                        bot.whisper("Cheating... [elapsed is %d secs]"%elapsed, sender)
                    else:
                        def ptime(s):   # pretty time
                            mins = s/60
                            secs = s%60
                            out = ""
                            if mins > 0:
                                out += '%d min, '%mins
                                out += '%d sec'%secs
                                return out
                            
                        bot.whisper("Easy there killer :P  Wait %s, then try again"%(ptime(cooldown - elapsed)))
                        return
            
            try:
                tokens = text.split()
                cmd = tokens[0]
                source = tokens[1]
                source = str(source).replace("[coords]","")
                source = source.replace("[/coords]","")
                source = source.replace(" ","")
                
                if len(tokens) > 2:
                    lvl_min = int(tokens[2])
                if len(tokens) > 3:
                    lvl_max = int(tokens[3])
                    
                if ':' in source:
                    # source is a city
                    x,y = map(int, source.split(':'))
                elif 'c' in source.lower():
                    # source is a continent
                    cont = int(source.lower().strip('c'))
                    x = ((cont % 10) * 100) + 50
                    y = ((cont / 10) * 100) + 50
                else:
                    raise ValueError
                    
            except (IndexError, ValueError, TypeError):
                bot.whisper('try again: !hunt city_coords OR cont [min level=7] [max level=10]>', sender)
                bot.whisper('e.g. !hunt c22 8', sender)
                return

            db.execute('insert or replace into boss_cooldown (player, time) values (?, ?)',(sender,now))
            database.commit()

            if lvl_min < 1:
                lvl_min = 1
            if lvl_max > 10:
                lvl_max = 10
            if lvl_max < lvl_min:
                lvl_min = lvl_max

            # get all bosses on the continent
            cells = world.pos2contcells(x,y)
            world_data = connect.getWorldInfo(cells)
            bosses = world.parse_bosses(world_data)

            # limit to the lvl_min and continent we're interested in
            bosses = [b for b in bosses if
                      b['alive'] and
                      b['level'] >= lvl_min and
                      b['level'] <= lvl_max and
                      world.get_cont(b['x'],b['y']) == world.get_cont(x,y)]

            # sort by highest level first or distance depending on request
            if cont:
                bosses = sorted(bosses, key=lambda a: -a['level'])
            else:
                import math
                bosses = sorted(bosses, key=lambda a: math.sqrt((x - a['x'])**2 + (y - a['y'])**2))

            # restrict number returned
            if len(bosses) > 10:
                bosses = bosses[:10]

            # create the response
            if len(bosses) > 0:
                response = ', '.join(["%s%d %03d:%03d"%(b['name'][0], b['level'], b['x'], b['y']) for b in bosses])
            else:
                response = 'None found, mate.'

            bot.whisper(response, sender)
        return

    # Player commands

#    if 'botx' in text.lower():
#        bot.output(sender+' touched me in an inappropriate way','C')

    # Random facts
    if 'random' in text.lower() and 'botx' not in text.lower():
        db = database.get_db()
        resp = db.execute('select fact from random_facts order by random() limit 1')
        responce = 'RANDOM..'+str(resp.fetchone())[3:-3]
        bot.output(responce,chatroom)
