from __future__ import print_function
from flask import Flask, request, redirect, url_for, render_template, Response, jsonify, make_response, send_file
import flask
from flask_socketio import SocketIO
import docx
import datetime
import re
import time
import pymysql
from ArticutAPI import Articut
import json
import numpy as np
import pandas as pd
from requests import post
from werkzeug.utils import secure_filename
import httplib2
import os
import io
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
from apiclient.http import MediaFileUpload, MediaIoBaseDownload
import speech_recognition as sr
try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None
import auth
# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/drive-python-quickstart.json
SCOPES = 'https://www.googleapis.com/auth/drive'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Drive API Python Quickstart'
authInst = auth.auth(SCOPES, CLIENT_SECRET_FILE, APPLICATION_NAME)
credentials = authInst.getCredentials()
http = credentials.authorize(httplib2.Http())
drive_service = discovery.build('drive', 'v3', http=http)
# above are settings for google drive api
UPLOAD_FOLDER = 'D:/legal_hackathon/2021/python_server/data_storage/'
ALLOWED_EXTENSIONS = set(['docx', 'doc'])
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 48 * 1024 * 1024  # 48MB
username = 'we311311@gmail.com'
api_key = 'naNmIw94eXhqpp_#s*XG-bPank9MH$^'
copytoasterkey = 'W2QHx9npjyCVmXsYNuT6E7tOqzSl-i1'
urlsendinformation = 'https://api.droidtown.co/CopyToaster/Command/'
copytoasterurl = 'https://api.droidtown.co/CopyToaster/API/'
articut = Articut(username, api_key)
# above are settings for server and analyse data and judgement


def listFiles(size):
    results = drive_service.files().list(
        pageSize=size, fields="nextPageToken, files(id, name)").execute()
    items = results.get('files', [])
    if not items:
        print('No files found.')
    else:
        print('Files:')
        for item in items:
            print('{0} ({1})'.format(item['name'], item['id']))


def uploadFile(filename, filepath, mimetype):
    file_metadata = {'name': filename}
    media = MediaFileUpload(filepath,
                            mimetype=mimetype)
    file = drive_service.files().create(body=file_metadata,
                                        media_body=media,
                                        fields='id').execute()
    return file.get('id')


def downloadFile(file_id, filepath):
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        status, done = downloader.next_chunk()
        print("Download %d%%." % int(status.progress() * 100))
    with io.open(filepath, 'wb') as f:
        fh.seek(0)
        f.write(fh.read())


def createFolder(name):
    file_metadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    file = drive_service.files().create(body=file_metadata,
                                        fields='id').execute()
    print('Folder ID: %s' % file.get('id'))


def searchFile(size, query):
    results = drive_service.files().list(
        pageSize=size, fields="nextPageToken, files(id, name, kind, mimeType)", q=query).execute()
    items = results.get('files', [])
    if not items:
        print('No files found.')
    else:
        print('Files:')
        for item in items:
            print(item)
            print('{0} ({1})'.format(item['name'], item['id']))
# above are google drive api


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


def get_file_from_mysql(data):
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
    command = "SELECT file_name,file_content,file_id FROM documentstore WHERE MATCH(file_keywords,file_content,file_name) AGAINST('" + \
        data+"') "+"LIMIT 20"
    cursora.execute(command)
    result = cursora.fetchall()
    file_list = []
    for i in result:
        file_list.append({'id': i[2], 'name': i[0], 'content': i[1]})
    return file_list


def get_result_from_mysql(data, extra):
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
    command = "SELECT full_judgement,penalty,similarresult FROM judgement WHERE MATCH(keywords,judgement,no,sys,similarresult) AGAINST('" + \
        data+"'IN BOOLEAN MODE) "+extra+"LIMIT 250"
    cursora.execute(command)
    result = cursora.fetchall()
    penalty_list = []
    similar_list = []
    for i in result:
        result_list.append(i[0])
        penalty_list.append(i[1])
        similar_list.append(eval(i[2]))
    return result_list, penalty_list, similar_list


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


def uploadfile2mysql(file_name, file_content, file_keywords, file_id):
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
    command = 'INSERT INTO documentstore(file_name,file_content,file_id,file_keywords) VALUES(%s,%s,%s,%s)'
    try:
        cursora.execute(
            command, (file_name, file_content, file_id, file_keywords))
        conn.commit()
    except Exception as e:
        print(e)


@app.route('/getdata')
def send_keywords():
    if request.method == "GET":
        return_data = ""
        selected_data = request.args.get("selected_data")
        extra = request.args.get('extra')
        if(selected_data != ''):
            for i in getallkeyword(selected_data):
                return_data += (" "+i)
        param = request.args.get('keys')+return_data
        return1, penalty, similar = get_result_from_mysql(
            param, extra)
        file_list = get_file_from_mysql(param)
        # print(return1)
        return "mycallbackfordata("+str({"data": return1, "penalty": penalty, 'files': file_list, 'similar': similar})+")"


@app.route('/uploadfile', methods=['GET', 'POST'])
def uploadfile():
    if request.method == "POST":
        try:
            file = request.files['file']
            if file:  # and allowed_file(file.filename)
                file_name = file.filename  # secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'],
                                       file_name))
                # return redirect(url_for('uploaded_file',
                #                         filename=file_name))
                file_address = 'D:\\legal_hackathon\\2021\\python_server\\data_storage\\'+file_name
                root, extension = os.path.splitext(file_address)
                file_content = ""
                try:
                    if extension == '.mp3' or extension == '.wav':
                        print('.mp3 uploaded')
                        file_id = uploadFile(
                            file_name, file_address, 'audio/mp3')
                        r = sr.Recognizer()
                        with sr.AudioFile(file_address) as source:
                            # listen for the data (load audio to memory)
                            audio_data = r.record(source)
                            # recognize (convert from speech to text)
                            file_content = r.recognize_google(
                                audio_data, language='zh-TW')

                    else:
                        file_id = uploadFile(
                            file_name, file_address, 'application/msword')  # MIME TYPES
                        #file_ref = open(file_address, "rb")
                        # get docx content
                        doc = docx.Document(file_address)
                        for i in doc.paragraphs:
                            file_content += i.text
                    # get keywords from content
                    file_keywords = ''
                    for i in getallkeyword(file_content):
                        file_keywords += (" "+i)
                    # upload file
                    uploadfile2mysql(file_name, file_content,
                                     file_keywords, file_id)
                    # print(file_content)
                except Exception as e:
                    print('doc process '+str(e))
                    response = flask.jsonify({'message': 'fail'})
                    response.headers.add('Access-Control-Allow-Origin', '*')
                    return response
        except Exception as ex:
            print(ex)
            response = flask.jsonify({'message': 'fail'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
    response = flask.jsonify({'message': 'success'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/return_file', methods=['GET', 'POST'])
def return_file():
    id = request.args['id']
    print(id)
    name = request.args['name']
    print(name)
    downloadFile(
        id, 'D:/legal_hackathon/2021/python_server/data_storage/'+name)
    # as_attachment 一定要加
    return send_file('D:/legal_hackathon/2021/python_server/data_storage/'+name, as_attachment=True)


@app.route('/test_getdata')
def send_word():
    return "mycallback("+str({"data": [2, 77]})+")"


if __name__ == "__main__":
    app.run(debug=True)
