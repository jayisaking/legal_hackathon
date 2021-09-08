var selected_data_for_storage = ''

function marksentences(str1, findstr) {
    let temp = 0
    let txtresult = ''
    while (str1.indexOf(findstr, temp) != -1) {
        let start = str1.indexOf(findstr, temp)
        if (start != -1) {
            let former = 0
            let next = str1.length - 1
            let nextcomma = str1.indexOf('，', start + findstr.length)
            let nextperiod = str1.indexOf('。', start + findstr.length)
            if (nextcomma == -1) {
                if (nextperiod != -1) {
                    next = nextperiod - 1
                }
            } else {
                if (nextperiod == -1) {
                    next = nextcomma - 1
                } else {
                    next = Math.min(nextcomma, nextperiod) - 1
                }
            }


            if (start != 0) {
                let formercomma = str1.lastIndexOf('，', start - 1)
                let formerperiod = str1.lastIndexOf('。', start - 1)
                if (formercomma == -1) {
                    if (formerperiod != -1) {
                        former = formerperiod + 1
                    }
                } else {
                    if (formerperiod == -1) {
                        former = formercomma + 1
                    } else {
                        former = Math.max(formercomma, formerperiod) + 1
                    }

                }
            }
            str1 = str1.slice(0, former) + '<mark>' + str1.slice(former, next + 1) + '</mark>' + str1.slice(next + 1)
            temp = str1.lastIndexOf('</mark>') + 7
        }

    }
    return str1
}

function pop_up_windows_for_debug(text) {
    //$('.popup').text(text)
    //$('.popup').fadeIn().delay(1000).fadeOut()
}

function datetrans(datestring) {
    return datestring.substring(0, 4) + "年" + datestring.substring(5, 7) + "月" + datestring.substring(8,
        10) + "日";
}

function get_selected_paragraph() {
    try {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {

            if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                pop_up_windows_for_debug('Action failed. Error: ' + asyncResult.error.message);
                get_analysed_keywords("")
                return
            } else {
                var temp = asyncResult.value
                if (temp != "" && temp != " ") {
                    pop_up_windows_for_debug("asyncvalue : " + temp)
                    get_analysed_keywords(temp)
                    return
                } else {
                    pop_up_windows_for_debug("second")
                    get_analysed_keywords("")
                    return
                }

            }
        });
    } catch (e) {
        pop_up_windows_for_debug(e.message)
        pop_up_windows_for_debug("second")
        get_analysed_keywords("")
        return
    } finally {
        return
    }

}

function get_analysed_keywords(data) {
    var keywords_for_entering = ""
    let extra_condition = ""
    if (!($("#civic_check").is(':checked') && $("#criminal_check").is(':checked'))) {
        if ($("#civic_check").is(':checked')) {
            extra_condition += " and sys ='民事' "
        } else if ($("#criminal_check").is(':checked')) {
            extra_condition += " and sys ='刑事' "
        }
    }
    if (!($("#determine_check").is(':checked') && $("#precedent_check").is(':checked'))) {
        if ($("#determine_check").is(':checked')) {
            keywords_for_entering += ' +"type判決"'
        } else if ($("#precedent_check").is(':checked')) {
            keywords_for_entering += ' +"type判例"'
        }
    }
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
    if ($('#year').val() != "" && $('#year').val() != " ") { //year word number
        keywords_for_entering += (" +" + $('#year').val() + "年度") //100年度交附民字第104號
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
            'selected_data': data,
            'extra': extra_condition
        },
        dataType: "jsonp",
        success: function (data, textStatus) {
            let similar_list = data['similar']
            console.log(similar_list)
            let file_list = data['files']
            let penalty_data = data["penalty"]
            data = data["data"]

            let keys = []
            let pairs = {}
            $('.temp').html('');
            try {
                myChart.destroy()
            } catch (e) {
                console.log(e.message)
            }
            pop_up_windows_for_debug("return data length = " + data.length)
            // console.log(data[0].replace(/\\n/g,'nn'))//.replace(/(?:\r\n|\r|\n)/g, '<br>')
            let tempkeys = []
            if ($(".searchbox").val() != "" && $(".searchbox").val() != " ") {
                tempkeys = $(".searchbox").val().split(" ")
            }
            for (var i = 0; i < data.length; i++) {
                try {

                    data[i] = data[i].replace(/(?:\\r\\n|\\r|\\n)/g, '<br>');
                    data[i] = data[i].replace(/'/g, '"');
                    data[i] = JSON.parse(data[i]);
                    penalty = '' + penalty_data[i]
                    if (data[i]['mainText'] == '原裁定廢棄') {
                        continue
                    }
                    if (keys.includes(penalty) && pairs.hasOwnProperty(penalty)) {
                        pairs[penalty]++
                    } else {
                        keys.push(penalty)
                        pairs[penalty] = 1
                    }
                    let similars = '<div class="relative_wrapper"' + " id='" + i + 'sim\'>'
                    for (let kk = 0; kk < similar_list[i].length; kk++) {
                        similars = similars + '<div class="relative_elements">' + similar_list[i][kk] + '</div>'
                    }
                    similars = similars + '</div>'
                    let content = data[i]['judgement']
                    if (tempkeys.length != 0) {
                        for (let d = 0; d < tempkeys.length; d++) {
                            content = marksentences(content, tempkeys[d])
                        }
                    }
                    if (data[i].hasOwnProperty('mainText') && data[i].hasOwnProperty('reason') &&
                        data[
                            i].reason != "" && data[i].mainText != "") {
                        $('.temp').append("<button  class='display' id='" + i + "_'>" + similars + "<div>" + data[i][
                                'no'
                            ] + "<br>" + data[i]['court'] + data[i]['sys'] + data[i]['type'] +
                            "<br><br>" + data[i]['reason'] + "<br><br>" + data[i]['mainText'] +
                            "</div></button>");
                        $('.temp').append("<div class='display_judgement' id='" + i + "judgement'>" +
                            content + "</div>")
                    } //datetrans(data[i]['date'])
                } catch (err) {
                    pop_up_windows_for_debug(err.message)
                    continue;
                } finally {
                    continue;
                }
                //console.log(data[i]['reason'])
            }
            display_bar(keys, pairs)
            $(".display").bind("click", function (event) {
                var temp_id = this.id.substring(0, this.id.length - 1);
                console.log(temp_id);
                var selector = '#' + temp_id + 'judgement';
                if ($(selector).css('display') == 'block') {
                    $('#'+temp_id+'_').css('border-color','transparent');
                    $('#'+temp_id+'_').hover(function () {
                            $(this).css('border-color', '#ff6384');
                        }, function(){
                            $(this).css("border-color", "transparent");
                          }
                    );

                    $('#' + temp_id + 'sim').css('display', 'none');
                    
                    $(selector).slideUp(500)
                    //$(selector).css('display', 'none');
                } else {
                    $('#'+temp_id+'_').css({"border-color": "#FF6384", 
                    "border-width":"1px", 
                    "border-style":"solid"});
                    $('#' + temp_id + 'sim').css('display', 'block');
                    $(selector).slideDown(500)
                    //$(selector).css('display', 'block');
                }

            })
            console.log("returned files length : " + file_list.length)
            $('.element_wrapper').html('')

            for (let k = 0; k < file_list.length; k++) {
                let content = file_list[k]['content']
                if (tempkeys.length != 0) {
                    for (let d = 0; d < tempkeys.length; d++) {
                        content = marksentences(content, tempkeys[d])
                    }
                }
                $('.element_wrapper').append('<div class="sidebar_element" id="selement_' + k + '"><span id="name_' + k + '">' + file_list[k]['name'] + '</span><i class="fas fa-download" id="faelement_' + k + '" ></i>' + '<div class="elementtext">' + content + '</div>' + '<div class="fileid">' + file_list[k]['id'] + '</div>' + '</div>');
            }
            $(".sidebar_element").click(function (event) {
                let temp_id = this.id
                console.log(temp_id + ' click');
                let selector = '#' + temp_id + " " + '.elementtext';
                if ($(selector).css('display') == 'block') {
                    $('#' + temp_id).removeClass('active')
                    $(selector).removeClass('active')
                    return
                }
                $('.elementtext').removeClass('active')
                $('.sidebar_element').removeClass('active')

                if ($(selector).css('display') == 'none') {
                    $('#' + temp_id).addClass('active')
                    $(selector).addClass('active')
                }
            })
            $('.sidebar_element .fa-download').click(function (e) {
                e.stopPropagation();
                let temp_id = this.id.substring(10)
                let file_id = $('#selement_' + temp_id + ' .fileid').text().trim();
                let file_name = $('#name_' + temp_id).text().trim()
                console.log(file_id)
                $('.downloadfile').click(function (e) {
                    e.preventDefault();
                    console.log('downloadfile triggered')
                    window.location.href = 'http://127.0.0.1:5000/return_file?id=' + file_id + "&name=" + file_name
                });
                $('.downloadfile').click();

            });
        },
        jsonpCallback: 'mycallbackfordata',
        error: function (jqXHR, textStatus, errorThrown) {
            pop_up_windows_for_debug("get_analysed_keywords : " + textStatus);

        }
    });

}

function get_result() {
    var keywords_for_entering = ""
    let extra_condition = ""
    if (!($("#civic_check").is(':checked') && $("#criminal_check").is(':checked'))) {
        if ($("#civic_check").is(':checked')) {
            extra_condition += " and sys ='民事' "
        } else if ($("#criminal_check").is(':checked')) {
            extra_condition += " and sys ='刑事' "
        }
    }
    if (!($("#determine_check").is(':checked') && $("#precedent_check").is(':checked'))) {
        if ($("#determine_check").is(':checked')) {
            keywords_for_entering += ' +"type判決"'
        } else if ($("#precedent_check").is(':checked')) {
            keywords_for_entering += ' +"type判例"'
        }
    }
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
    if ($('#year').val() != "" && $('#year').val() != " ") { //year word number
        keywords_for_entering += (" +" + $('#year').val() + "年度") //100年度交附民字第104號
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
            keyword: keywords_for_entering,
            extra: extra_condition
        },
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (data, textStatus) {
            //data=data["data"]
            try {
                myChart.destroy()
            } catch (e) {
                console.log(e.message)
            }
            $('.temp').html('');
            pop_up_windows_for_debug("return data length = " + data.length)
            let keys = []
            let pairs = {}
            let len = data.length / 2
            // console.log(data[0].replace(/\\n/g,'nn'))//.replace(/(?:\r\n|\r|\n)/g, '<br>')
            for (var i = 0; i < len; i++) {
                try {
                    data[i] = data[i].replace(/(?:\\r\\n|\\r|\\n)/g, '<br>');
                    data[i] = data[i].replace(/'/g, '"');
                    data[i] = JSON.parse(data[i]);
                    penalty = '' + data[i + len]
                    if (keys.includes(penalty)) {
                        pairs[penalty]++
                    } else {
                        keys.push(penalty)
                        pairs[penalty] = 1
                    }
                    /*if (data[i].hasOwnProperty('mainText') && data[i].hasOwnProperty('reason') &&
                        data[
                            i].reason != "" && data[i].mainText != "") {*/
                    $('.temp').append("<button  class='display' id='" + i + "_'><div>" + data[i][
                            'no'
                        ] + "<br>" + data[i]['court'] + data[i]['sys'] + data[i]['type'] +
                        "<br><br>" + data[i]['reason'] + "<br><br>" + data[i]['mainText'] +
                        "</div></button>");
                    $('.temp').append("<div class='display_judgement' id='" + i + "judgement'>" +
                        data[i]['judgement'] + "</div>")

                    //} //datetrans(data[i]['date'])
                } catch (err) {
                    continue;
                } finally {
                    continue;
                }
                //console.log(data[i]['reason'])
            }
            console.log(keys)
            console.log(pairs)
            display_bar(keys, pairs)
            $(".display").bind("click", function (event) {
                var temp_id = this.id.substring(0, this.id.length - 1);
                console.log(temp_id);
                var selector = '#' + temp_id + 'judgement';
                if ($(selector).css('display') == 'block') {
                    $(selector).slideUp(500)
                    //$(selector).css('display', 'none');
                } else {
                    //$(selector).css('display', 'block');
                    $(selector).slideDown(500)
                }
            })
        },
        jsonpCallback: 'mycallback',
        error: function (jqXHR, textStatus, errorThrown) {
            pop_up_windows_for_debug("get_result : " + textStatus)
        }
    })
}



function send_file(file_data) { //no use
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/uploadfile",
        data: file_data,
        // dataType: "jsonp",
        cache: false,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log(response)
            if (response['message'] == 'success') {
                $('.buttonul').addClass('active')
                $('.upload_iw .fa-check').addClass('active')
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("send_file : " + textStatus)
        }
    });
}