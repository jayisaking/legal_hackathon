var myChart = {}

function draw_bar(id, label, labels, data, backgroundColor, borderColor) {
    // $(id).remove(); // this is my <canvas> element
    // $('.chart_wrapper').append('<canvas id="'+id+'"><canvas>');
    var ctx = document.getElementById(id).getContext('2d');
    let data_length = data.length
    let backgroundca = new Array(data_length)
    let borderca = new Array(data_length)
    backgroundca.fill(backgroundColor)
    borderca.fill(borderColor)
    try {
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: backgroundca, //'rgba(255, 99, 132, 0.2)紅'//'rgba(118,144,218, 0.2)' 藍色                                                                                 
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    xAxes: [{
                        // x 軸標題
                        scaleLabel: {
                            display: true,
                            labelString: "月",
                            fontSize: 14,

                        },
                        ticks: {
                            padding: 3
                        }

                    }],
                    yAxes: [{
                        // y 軸標題
                        scaleLabel: {
                            display: true,
                            labelString: "案件數",
                            fontSize: 14
                        },
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }]

                }
            }
        });
        $('.label_x').css('display', 'block');
    } catch (e) {
        pop_up_windows_for_debug(e.message)
    }
}

function display_bar(keys, pairs) {
    try {
        if (keys.length === 0) {
            return
        }
        // let index = keys.indexOf("0");
        //  if (index > -1) {
        //  keys.splice(index, 1);
        // }
        // if(keys.length==0){
        //     return
        // }
        keys = keys.sort(function (a, b) {
            return Number(a) - Number(b)
        })
        data = []
        for (var i = 0; i < keys.length; i++) {

            data.push(pairs[keys[i]])
            if (keys[i] == '-1') {
                keys[i] = '拘役'
            } else if (keys[i] == '0') {
                keys[i] = '非自由刑'
            }
        }
        console.log(data)
        draw_bar('chart', '數量', keys, data, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)')
        console.log('display_bar')
    } catch (e) {
        pop_up_windows_for_debug(e.message)
    }
}