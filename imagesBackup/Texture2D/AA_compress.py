from PIL import ImageTk, Image
from os import listdir
from os.path import isfile, join
import os
onlyfiles = [f for f in listdir("d:/developement/score calculator/images/Texture2D") if isfile(join("d:/developement/score calculator/images/Texture2D", f))]
for im in onlyfiles :
    if im.find("CAS_") == 0 :
        curName = im.replace("CAS_", "").replace("_", " ")
        print(curName)
        
a = input("These will be replaced. y/n ?")
if a == "y" :
    for im in onlyfiles :
        if im.find("CAS_") == 0 :
            curName = im.replace("CAS_", "").replace("_", " ")
            os.rename(curName, im)