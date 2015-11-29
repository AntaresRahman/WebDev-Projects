#Antares Rahman & Patrik Devlin
#Python script
#Generates an HTML file based on information from user
#
#Images used in the program are neither
#created nor owned by us. They have been
#used only as examples/placeholders. All
#credits are due to the creators of the
#images, Angry Birds, Rovio Entertainment Ltd.
#No images may be used for any purpose,
#as they may be subjected to copyright laws.
#2/17/2015

import random, string, time, webbrowser

#method to form html tags
def wrap(tag, info):
    endtag = tag.split()
    endtag = endtag[0]
    endtag = endtag.replace('<', '</')
    if (endtag[-1] != '>'):
        endtag += '>'
    return (tag + "\n    " + info.replace("\n", "\n    ") + "\n" + endtag)

def generateHTML():
    configFile = open("config.txt", 'r') #input file from user
    htmlFile = open("new.html", 'w') #output html file
    dictionary = {} #stores information from configFile

    #read through file upto line 7
    for line in range(5):
        text = configFile.readline().split()
        dictionary[text[0]] = text[1]
    #TITLE and AUTHOR
    for line in range(2):
        text = configFile.readline().split()
        description = text[1]
        #if split causes more than 2 strings
        if (len(text)>2):
            for i in range(2, len(text)):
                description = description + " " + text[i]
        dictionary[text[0]] = description

    #IMAGES or LETTER
    text = configFile.readline()
    dictionary[text] = ""
    parity = 0 #to check for alternating cell
    allTR = "" #string builder for all <tr> row tags
    
    if (text=="IMAGES\n"):
        for line in configFile.readlines():
            listImagesRow = line.split() #a row of images
            allTD = "" #string builder for all <td> cell tags
            #for each image in the row
            for image in listImagesRow:
                image = '<img src="images/'+image+'"/>'
                td = wrap('<td class="cell'+str(parity)+'">', image)
                if (parity == 0): #even cell
                    parity+=1
                else: #odd cell
                    parity-=1
                allTD = allTD + td + "\n"
            tr = wrap('<tr>', allTD)
            allTR = allTR + tr + "\n"
            if ((len(listImagesRow))%2 == 0 and parity ==0):
                parity+=1
            elif ((len(listImagesRow))%2 == 0 and parity ==1):
                parity-=1
        
    else:
        dim = configFile.readline().split('x') #dimensions
        letters = string.ascii_letters #all alphabets
        letterList = list(letters) #a list of each letter
        for m in range(int(dim[0])):
            allTD = "" #string builder for all <td> cell tags
            for n in range(int(dim[1])):
                #randomize letter selection
                randLetter = letterList[random.randrange(len(letterList))]
                td = wrap('<td class="cell'+str(parity)+'">', randLetter)
                if (parity == 0): #even cell
                    parity+=1
                else: #odd cell
                    parity-=1
                allTD = allTD + td + "\n"
            tr = wrap('<tr>', allTD)
            allTR = allTR + tr + "\n"
            #if columns are even
            if (int(dim[1])%2 == 0 and parity ==0):
                parity+=1
            elif (int(dim[1])%2 == 0 and parity ==1):
                parity-=1
                
    table = wrap('<table>', allTR)
    configFile.close()
    
    h1 = wrap('<h1>', dictionary["TITLE"])
    pString = 'Created automatically on: ' \
             +time.asctime( time.localtime(time.time()))+'\n' \
             +'</br>\n</br>\nAuthors: '+dictionary['AUTHORS']
    p = wrap('<p>', pString)
    allCenter = h1 + table + p
    center = wrap('<center>', allCenter)
    body = wrap('<body>', center)

    #styling details under <head> section
    details = "body {background-color: "+dictionary["BODY_BACKGROUND"]+";}\n" \
            ".cell0 {background-color: "+dictionary["CELL_BACKGROUND1"]+";}\n" \
            ".cell1 {background-color: "+dictionary["CELL_BACKGROUND2"]+";}\n" \
            "td {border: "+dictionary["TABLE_BORDER_PX"]+" solid " \
            +dictionary["TABLE_BORDER_COLOR"]+"; text-align: center;}" \
            "table {width: 60%; border-collapse: collapse;}\n" \
            "img {width: 100; height: 80;}"
    
    style = wrap('<style type="text/css">', details)
    head = wrap('<head>', style)

    allHTML = head + body
    html = wrap('<html>', allHTML)
    htmlFile.write(html)
    
    htmlFile.close()

    #opens new.html automatically
##    url = "new.html"
##    webbrowser.open(url,new=2)
    
generateHTML()
