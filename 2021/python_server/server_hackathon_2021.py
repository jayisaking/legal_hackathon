from flask import Flask, request, redirect, url_for, render_template, Response, jsonify, make_response
from requests import post
import pandas as pd
import numpy as np
import json
import os
from ArticutAPI import Articut
import pymysql
import time
import re
import datetime
from ArticutAPI import Articut
app = Flask(__name__)
username = 'we311311@gmail.com'
api_key = 'naNmIw94eXhqpp_#s*XG-bPank9MH$^'
copytoasterkey = 'W2QHx9npjyCVmXsYNuT6E7tOqzSl-i1'
urlsendinformation = 'https://api.droidtown.co/CopyToaster/Command/'
copytoasterurl = 'https://api.droidtown.co/CopyToaster/API/'
articut = Articut(username, api_key)


def getkeywordlist(list2):
    templist = []
    if len(list2) == 0:
        return []
    if str(type(list2[0])) != "<class 'list'>" and str(type(list2[0])) != "<class 'tuple'>":
        if len(list2) == 1:
            templist.append(list2[0])
        elif len(list2) == 3:
            templist.append(list2[2])
        else:
            for i in list2:
                templist.append(i)
    else:
        for i in list2:
            templist += getkeywordlist(i)
    templist = list(set(templist))
    return templist


def str_process(str1):
    return str1.replace('\\', '/').replace('\n', '').replace('\r', '').replace(' ', '').replace('\u3000', '').replace(',', "").replace('。', '')


def printandnl(str1):
    print()
    if str(type(str1)) == "<class 'str'>":
        print(str1_process(str1))
    elif str(type(str1)) == "<class 'list'>":
        print(list_process(str1))
    else:
        print(str1)
    print()


def list_process(temp):
    while [] in temp:
        temp.remove([])
    return temp


def partylist(list1):
    temp_list = []
    for i in list1:
        temp_list.append(i['value'])
    return temp_list


def get_result_from_mysql(data):
    result_list = []
    db_settings = {
        'host': 'localhost',
        'user': 'root',
        'password': 'huigre;ao',
        'db': 'hackathon2021',
        "charset": "utf8"
    }
    try:
        conn = pymysql.connect(host='localhost', user='root',
                               password='huigre;ao', database='hackathon2021', charset='utf8')
    except Exception as ex:
        print(ex)
    cursora = conn.cursor()
    command = "SELECT * FROM judgement WHERE MATCH(full_judgement) AGAINST('" + \
        data+"'IN BOOLEAN MODE)"
    cursora.execute(command)
    result = cursora.fetchall()
    o=0
    for i in result:
        o+=1
        if o > 500:
            break
        result_list.append(i[1])
    return result_list


def relatedissues(list1):
    temp_list = []
    for i in list1:
        temp_list.append(i['lawName']+i['issueRef'])
    return temp_list


def getallkeyword(data):
    result = articut.parse(str_process(data))
    lists = []
    contentwordLIST = articut.getContentWordLIST(result, indexWithPOS=False)
    verbStemLIST = articut.getVerbStemLIST(result, indexWithPOS=False)
    nounStemLIST = articut.getNounStemLIST(result, indexWithPOS=False)
    locationStemLIST = articut.getLocationStemLIST(result, indexWithPOS=False)
    personLIST = articut.getPersonLIST(
        result,  includePronounBOOL=False, indexWithPOS=False)
    timeLIST = articut.getTimeLIST(result, indexWithPOS=False)
    ageLIST = articut.NER.getAge(result, indexWithPOS=False)
    moneyLIST = articut.NER.getMoney(result, indexWithPOS=False)
    lists.append(verbStemLIST)
    lists.append(contentwordLIST)
    lists.append(nounStemLIST)
    lists.append(locationStemLIST)
    lists.append(personLIST)
    lists.append(timeLIST)
    lists.append(ageLIST)
    lists.append(moneyLIST)
    strtemp = []
    for i in lists:
        strtemp += getkeywordlist(i)
    return list(set(strtemp))


@app.route('/getdata')
def send_keywords():
    if request.method == "GET":
        return_data = ""
        selected_data = request.args.get("selected_data")
        if(selected_data != ''):
            for i in getallkeyword(selected_data):
                return_data += (" "+i)
        return1 = get_result_from_mysql(request.args.get('keys')+return_data)
        print(return1)
        return "mycallbackfordata("+str({"data":return1})+")"


@app.route('/test_getdata')
def send_word():
    return "mycallback("+str({"data":[2,77]})+")"


if __name__ == "__main__":
    app.run(debug=True)
