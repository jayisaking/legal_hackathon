var selected_data_for_storage=''
function datetrans(datestring) {
    return datestring.substring(0, 4) + "年" + datestring.substring(5, 7) + "月" + datestring.substring(8,
        10) + "日";
}

function get_selected_paragraph() {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {

        if (asyncResult.status == Office.AsyncResultStatus.Failed) {
            pop_up_windows_for_debug('Action failed. Error: ' + asyncResult.error.message);
            get_result()
            return
        }
        else {
            var temp = asyncResult.value
            if (temp != "" && temp != " ") {
                pop_up_windows_for_debug("asyncvalue : "+temp)
                get_analysed_keywords(temp)
                return
            } else {
                pop_up_windows_for_debug("second")
                get_result()
                return
            }
            
        }
    });
}
function get_analysed_keywords(data) {
    var keywords_for_entering = ""
    if ($(".searchbox").val() != "" && $(".searchbox").val() != " ") {
        var tempstrings = $(".searchbox").val().split(" ")
        for (var i = 0; i < tempstrings.length; i++) {
            if (tempstrings[i] == "" && tempstrings == " ") {
                continue
            }
            keywords_for_entering += (" +" + tempstrings[i])
        }
    }
    var examine = false;
    if ($('#year').val() != "" && $('#year').val() != " ") {//year word number
        keywords_for_entering += (" +" + $('#year').val() + "年度")//100年度交附民字第104號
        examine = true
    }
    if ($('#word').val() != "" && $('#word').val() != " ") {
        if (examine) {
            keywords_for_entering += ($('#word').val() + '字')
        } else {
            examine = true
            keywords_for_entering += (" +" + $('#word').val() + "字")
        }
    }
    if ($('#number').val() != "" && $('#number').val() != " ") {
        if (examine) {
            keywords_for_entering += ("第" + $('#number').val() + '號')
        } else {
            examine = true
            keywords_for_entering += (" +第" + $('#number').val() + "號")
        }
    }
    $.ajax({
        type: "GET",
        url: "http://127.0.0.1:5000/getdata",
        data: {
            'keys': keywords_for_entering,
            'selected_data':data
        },
        dataType: "jsonp",
        success: function (data, textStatus) {
            data=data["data"]
            $('.temp').html('');
            pop_up_windows_for_debug("return data length = " + data.length)
            // console.log(data[0].replace(/\\n/g,'nn'))//.replace(/(?:\r\n|\r|\n)/g, '<br>')
            for (var i = 0; i < data.length; i++) {
                try {
                    data[i] = data[i].replace(/(?:\\r\\n|\\r|\\n)/g, '<br>');
                    data[i] = data[i].replace(/'/g, '"');
                    data[i] = JSON.parse(data[i]);
                    if (data[i].hasOwnProperty('mainText') && data[i].hasOwnProperty('reason') &&
                        data[
                            i].reason != "" && data[i].mainText != "") {
                        $('.temp').append("<button  class='display' id='" + i + "_'><div>" + data[i][
                            'no'
                        ] + "<br>" + data[i]['court'] + data[i]['sys'] + data[i]['type'] +
                            "<br><br>" + data[i]['reason'] + "<br><br>" + data[i]['mainText'] +
                            "</div></button>");
                        $('.temp').append("<div class='display_judgement' id='" + i + "judgement'>" +
                            data[i]['judgement'] + "</div>")
                    } //datetrans(data[i]['date'])
                } catch (err) {
                    continue;
                } finally {
                    continue;
                }
                //console.log(data[i]['reason'])
            }
            $(".display").bind("click", function (event) {
                var temp_id = this.id.substring(0, this.id.length - 1);
                console.log(temp_id);
                var selector = '#' + temp_id + 'judgement';
                if ($(selector).css('display') == 'block') {
                    $(selector).css('display', 'none');
                } else {
                    $(selector).css('display', 'block');
                }
            })
        },
        jsonpCallback: 'mycallbackfordata',
        error: function (jqXHR, textStatus, errorThrown) {
            pop_up_windows_for_debug("get_analysed_keywords : " + textStatus);

        }
    });
    
}
function get_result() {
    var keywords_for_entering = ""
    if ($(".searchbox").val() != "" && $(".searchbox").val() != " ") {
        var tempstrings = $(".searchbox").val().split(" ")
        for (var i = 0; i < tempstrings.length; i++) {
            if (tempstrings[i] == "" && tempstrings == " ") {
                continue
            }
            keywords_for_entering += (" +" + tempstrings[i])
        }
    }
    var examine = false;
    if ($('#year').val() != "" && $('#year').val() != " ") {//year word number
        keywords_for_entering += (" +" + $('#year').val() + "年度")//100年度交附民字第104號
        examine = true
    }
    if ($('#word').val() != "" && $('#word').val() != " ") {
        if (examine) {
            keywords_for_entering += ($('#word').val() + '字')
        } else {
            examine = true
            keywords_for_entering += (" +" + $('#word').val() + "字")
        }
    }
    if ($('#number').val() != "" && $('#number').val() != " ") {
        if (examine) {
            keywords_for_entering += ("第" + $('#number').val() + '號')
        } else {
            examine = true
            keywords_for_entering += (" +第" + $('#number').val() + "號")
        }
    }
    console.log(keywords_for_entering)
    console.log($(".searchbox").val())
    //keywords_for_entering += selected
    $.ajax({
        type: "GET",
        url: "http://localhost/KSSA_Register_System/phps/test.php",
        // url: "https://localhost/hackathon2021/2021hackathon/datascratch.php",
        //  headers: {  'Access-Control-Allow-Origin': '*' },
        ////data: {
        //    "keyword": keywords_for_entering
        //},
        //url: "http://127.0.0.1:5000/getdata",
        data: {
            keyword: keywords_for_entering
        },
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (data, textStatus) {
            //data=data["data"]
            $('.temp').html('');
            pop_up_windows_for_debug("return data length = " + data.length)
            // console.log(data[0].replace(/\\n/g,'nn'))//.replace(/(?:\r\n|\r|\n)/g, '<br>')
            for (var i = 0; i < data.length; i++) {
                try {
                    data[i] = data[i].replace(/(?:\\r\\n|\\r|\\n)/g, '<br>');
                    data[i] = data[i].replace(/'/g, '"');
                    data[i] = JSON.parse(data[i]);
                    if (data[i].hasOwnProperty('mainText') && data[i].hasOwnProperty('reason') &&
                        data[
                            i].reason != "" && data[i].mainText != "") {
                        $('.temp').append("<button  class='display' id='" + i + "_'><div>" + data[i][
                            'no'
                        ] + "<br>" + data[i]['court'] + data[i]['sys'] + data[i]['type'] +
                            "<br><br>" + data[i]['reason'] + "<br><br>" + data[i]['mainText'] +
                            "</div></button>");
                        $('.temp').append("<div class='display_judgement' id='" + i + "judgement'>" +
                            data[i]['judgement'] + "</div>")
                    } //datetrans(data[i]['date'])
                } catch (err) {
                    continue;
                } finally {
                    continue;
                }
                //console.log(data[i]['reason'])
            }
            $(".display").bind("click", function (event) {
                var temp_id = this.id.substring(0, this.id.length - 1);
                console.log(temp_id);
                var selector = '#' + temp_id + 'judgement';
                if ($(selector).css('display') == 'block') {
                    $(selector).css('display', 'none');
                } else {
                    $(selector).css('display', 'block');
                }
            })
        },
        jsonpCallback: 'mycallback',
        error: function (jqXHR, textStatus, errorThrown) {
            pop_up_windows_for_debug("get_result : "+textStatus)
        }
    })
}
function pop_up_windows_for_debug(text) {
    $('.popup').text(text)
    $('.popup').fadeIn().delay(1000).fadeOut()
}