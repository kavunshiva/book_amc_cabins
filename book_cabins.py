import grequests
from datetime import datetime, timedelta

URL = 'https://reservations.guestdesk.com/AppalachianMountainClub/19955/en/Room/Availability?webnode=main3&corsdomain=www.outdoors.org'
HEADERS = {
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9,de;q=0.8,es;q=0.7,fr;q=0.6,la;q=0.5,ja;q=0.4',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'dnt': '1',
    'guestdesk-context': 'Booking',
    'origin': 'https://www.outdoors.org',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://www.outdoors.org/',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'sec-gpc': '1',
    'session': '70d0ff11-4809-0ffb-d813-c78c21bea064',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
DATA='{"arrivalDate":"%s","departureDate":"%s","numRooms":1,"adults":"%s","children":0,"childAges":[],"UnitTypeIds":[402,403,404,405,406,407,408,409,424,425,426,427,430,431,428,429,493,432,449,450,519,455,451,454,452,453,461,458,459,457,456,520,462,501,468,469,465,460,466,463,464,598,483,446,447,444,443,445,448,436,437,435,434,433,413,412,414,415,487,416,418,417,410,411,498,475,476,474,473,421,492,509,422,420,419,423,485,478,471,702,491,482,499,500,489,490,600,601,518,442,488,441,440,438],"searchOptions":[{"SearchOptionId":20530,"SearchOptionCode":"20530","Id":20530,"Name":"Medawisla Lodge & Cabins","Description":"","FilterType":4,"FilterCategory":0,"UnitTypeIds":[443,444,445,446,447,448],"UnitIds":[],"Icon":"map-signs","Weight":15,"GroupId":1815,"hidden":false,"Selected":true,"matchingRoomModels":6,"AutoExpand":true}],"externalRate":null,"CustomSearchFields":{},"otherGuests":0,"disableSorting":false,"promoCode":"","rateFeatures":["","","","","",""],"filters":[{"SearchOptionId":20530,"SearchOptionCode":"20530","Id":20530,"Name":"Medawisla Lodge & Cabins","Description":"","FilterType":4,"FilterCategory":0,"UnitTypeIds":[443,444,445,446,447,448],"UnitIds":[],"Icon":"map-signs","Weight":15,"GroupId":1815,"hidden":false,"Selected":true,"matchingRoomModels":6,"AutoExpand":true}],"groupCode":""}'
DATE_FORMAT = '%Y-%m-%d'
CABIN_NAMES = ('Gorman', 'Lyford', 'Medawisla')

def available_cabins_request(date, number_of_guests):
    start_date = date.strftime(DATE_FORMAT)
    end_date = (date + timedelta(1)).strftime(DATE_FORMAT)
    return grequests.post(
        URL,
        headers=HEADERS,
        data=DATA %(start_date, end_date, number_of_guests)
    )

def cabin_available(response, cabin_name):
    for cabin in response.json():
        if cabin_name.lower() in cabin['UnitTypeName'].lower():
            return True
    return False

def available_cabins(start_date, days, number_of_guests, cabins=None, date_to_str=False):
    dates = []
    for day in range(days):
        dates.append(datetime.strptime(start_date, DATE_FORMAT) + timedelta(day))
    
    responses = grequests.map(
        [available_cabins_request(date, number_of_guests) for date in dates])
    availabilities = []
    for i, response in enumerate(responses):
        date = date_to_str and dates[i].strftime('%a, %b %e') or dates[i]
        availability = {'date' : date}
        for cabin_name in cabins or CABIN_NAMES:
            availability[cabin_name] = cabin_available(response, cabin_name)
        availabilities.append(availability)
    return availabilities
