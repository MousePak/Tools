import base91 as b91

def pos2contcells(x,y):
    '''Returns a list of cells for the continent that contains x,y.
    These are NOT b91 encoded.'''
    # Get bounding corners
    x1 = (x / 100) * 100
    y1 = (y / 100) * 100
    x2 = x1 + 99
    y2 = y1 + 99

    # Get unique cell numbers
    X = range(x1, x2, 32) + [x2]
    Y = range(y1, y2, 32) + [y2]

    # Get X cross Y plus borders
    cells = [(u,v) for u in X for v in Y]

    # Convert to cells
    cells = map(lambda a: get_cell(a[0],a[1]), cells)

    # Remove any duplicates
    cells = list(set(cells))

    return cells

def enc_cell(c):
    '''Base91 encodes a numeric cell.'''
    return b91.encpart((3<<10) + c, 2)

def get_cell(x,y):
    '''Returns the macro cell that a given coordinate is in.'''
    return (y & 0xfe0) + (x >> 5)

def get_cont(x,y):
    '''Returns the continent a coordinate is in.'''
    return (y/100)*10 + (x/100)

def parse_bosses(world_info):
    '''Returns a list of all bosses.
    world_info - direct response from session.getWorldInfo
    '''
    try:
        data = world_info[1]['D']['s']
    except KeyError:
        return
    except IndexError:
        return
    except TypeError:
        return

    bosses = []
    for d in data:
        cell = d['i']           # cell number
        objects = d['d']        # list of cities, dungeons, bosses, etc.
        bosses.extend([dec_boss(obj, cell) for obj in objects
                       if dec_boss(obj, cell)])

    return bosses

def dec_boss(d, cell=0, verbose = False):
    '''Decodes a boss string.
    d - The base91 encoded string from world data
    cell - The cell this string came from
    verbose - Whether to print a message
    '''
    bosses = {6: 'Dragon',
              7: 'Moloch',
              8: 'Hydra',
              12: 'Octopus'}
    
    locdata = b91.decpart(d[:2], 2)
    bossdata = b91.decpart(d[2:5], 3)
    timedata = b91.decpart(d[6:], 4)

    u = locdata & 0x1f
    v = (locdata >> 5) & 0x1f
    x = ((cell & 31) << 5) + u
    y = (cell & 0xffe0) + v
    cat = (locdata >> 10) & 0x7

    if cat != 3:
        return None

    alive = bossdata & 1
    bosstype = (bossdata >> 1) & 0xf
    bosslevel = (bossdata >> 5) & 0xf

    if verbose:
        print '%8s (Level %2d) at %03d:%03d %s'%(bosses.get(bosstype,bosstype), bosslevel, x, y, ['Alive','Dead'][alive])

    return {'cat':cat,
            'u':u, 'v': v, 'x':x, 'y':y,
            'type':bosstype, 'level':bosslevel, 'name': bosses.get(bosstype,'Unknown'),
            'alive':alive, 'd':d}
