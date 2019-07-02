var map;
var countries = new Array();
var estates = new Array();
var urls = new Array();

$.urlParam = function(name){ 
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href); 
    if (results==null) { return null; } 
    return decodeURI(results[1]) || 0; 
}

function getColor(d) {
    return d > 30 ? '#f1433a' : 
        d > 25 ? '#fb7f1f' : 
        d > 20 ? '#e6de31' : 
        d > 15 ? '#9ceb38' : 
        d > 10 ? '#00d58e' : 
        d > 5 ? '#03a2fa' : 
        '#2837ff'; 
}

function getRadius(d) {
    return d > 30 ? 9 : 
        d > 25 ? 8 : 
        d > 20 ? 7.5 : 
        d > 15 ? 7 : 
        d > 10 ? 6.5 : 
        d > 5 ? 6 : 
        5; 
}

function open_share() {
    $('#link-text-share').show();
    $('#copy-share').show();
    $('#close-share').show();
}

function close_share() {
    $('#link-text-share').hide();
    $('#copy-share').hide();
    $('#close-share').hide();
}

function clearAllCircleMarker() {
    for (var i in estates) {
        estates[i].marker.removeFrom(map);
    }
    for (var i in countries) {
        countries[i].marker.removeFrom(map);
    }
}

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function style(d) { 
    return { 
        fillColor: getColor(d), 
        weight: 0, 
        fillOpacity: .7
    }; 
}

function fill_countries_map(data) {
    data.countries.forEach(element => {
        countrie = element.sigla;
        coordinates = element.coordinates;
        countries[countrie] = {"marker": L.circleMarker(coordinates, {customID: countrie}), "name": element.countrie};
    });
}

function fill_estates_map(data) {
    data.estates.forEach(element => {
        estate = element.sigla;
        coordinates = element.coordinates;
        estates[estate] = {"marker": L.circleMarker(coordinates, {customID: estate}), "name": element.estate};
    });
}

function fill_select_events(data) {
    try {
        data.events.forEach(element => {
            var event = jsUcfirst(element);
            $('#select-event').append($('<option>', {
                value: element,
                text: event
            }));
        });

        // Insere valores dos parâmetros
        if ($.urlParam('event') != '' && $.urlParam('event') != null) {
            $("#select-event").val($.urlParam('event'));
        }
        if ($.urlParam('country') != '' && $.urlParam('country') != null) {
            $("#" + $.urlParam('country')).prop('checked', true);
        }
        if ($.urlParam('data_begin') != '' && $.urlParam('data_begin') != null) {
            $("#date-begin").val($.urlParam('data_begin'));
        }
        if ($.urlParam('data_end') != '' && $.urlParam('data_end') != null) {
            $("#date-end").val($.urlParam('data_end'));
        }

        request_api();
    }
    catch (err) {
        alert("No momento não há notícias a serem mostradas, tente novamente em outra hora!");
    }
}

function update_views(id) {
    $.get("write_views/" + id);
}

function update_details(id) {
    $.get("write_details/" + id);
}

function fill_urls(e) {
    $('#list-items').html('');
    urls[e.target.options.customID].forEach(element => {
        let id = element.id;
        update_details(id);
    });
    urls[e.target.options.customID].forEach(element => {
        let title = element.title;
        let description = element.description;
        let link = element.link;
        let id = element.id;
        if (link != '' && (title != '' || description != ''))
            $("#list-items").append('<li><a onclick="update_views(\''+id+'\')" href="//' + link.replace(/^https?:/, "") + '" target="_blank" class="link_url"><h4>' + title + '</h4><p>' + description + '</p></a></li>')
    });
    $('#links').show();
    $('.list-links').height($('#links').height() - $('#close-links').height() - 20);
}

function show_search(id) {
    id = "#".concat(id);
    if ($(id).is(":visible")) { $(id).hide(); }
    else { $(id).show(); }

    if (id == '#list-nav') {
        $('#item-events').hide();
        $('#item-location').hide();
        $('#item-date').hide();
    }
}

function response_api(data) {
    var message = "";
    clearAllCircleMarker();

    if (data.data == null) {
        alert("Não há notícias disponíveis!");
    }

    var event_item = "Todos os Eventos";
    if (data.event != '') event_item = jsUcfirst(data.event);

    if (data.country) {
        data.data.forEach(element => {
            local = element.local;
            count = element.count;

            if (countries[local] != null) {
                urls[local] = element.url;

                if (count == 1) {
                    message = "1 notícia de " + event_item + " em " + countries[local].name + ".";
                }
                else {
                    message = count + " notícias de " + event_item + " em " + countries[local].name + ".";
                }

                countries[local].marker.setRadius(getRadius(count))
                    .setStyle(style(count))
                    .bindPopup(message)
                    .on('click', fill_urls)
                    .addTo(map);
            }
        });
        map.setView([0, 0], 2);
    }
    else {
        data.data.forEach(element => {
            local = element.local;
            count = element.count;

            if (estates[local] != null) {
                urls[local] = element.url;
                if (count == 1) {
                    message = "1 notícia de " + event_item + " em " + estates[local].name + ".";
                }
                else {
                    message = count + " notícias de " + event_item + " em " + estates[local].name + ".";
                }

                estates[local].marker.setRadius(getRadius(count))
                    .setStyle(style(count))
                    .bindPopup(message)
                    .on('click', fill_urls)
                    .addTo(map);
            }
        });
        map.setView([-15.755340, -47.756096], 4);
    }

    // Atualizando os dados dos detalhes
    let text_event = $("#select-event option").filter(":selected").html();
    let text_location = ($('#countries').prop('checked') ? 'Todos os países':'Apenas o Brasil');

    $('#detail-event').html(text_event);
    $('#detail-location').html(text_location);

    if ($("#date-begin").val() != '') {
        var split_date = $("#date-begin").val().split('-');
        let text_date_begin = split_date[2] + '/' + split_date[1] + '/' + split_date[0];
        $('#detail-date-begin').html(text_date_begin);

        split_date = $("#date-end").val().split('-');
        let text_date_end = split_date[2] + '/' + split_date[1] + '/' + split_date[0];
        $('#detail-date-end').html(text_date_end);
    }
    else {
        $('#detail-date-begin').html('Sem data');
        $('#detail-date-end').html('Sem data');
    }

    // Atualiza link de compartilhamento
    let event = $("#select-event option").filter(":selected").val();
    let localization = $("#item-location input[type='radio']:checked").val();
    if ($("#date-begin").val() != '') {
        let date_begin = $("#date-begin").val();
        let date_end = $("#date-end").val();
        var link = $(location).attr('origin')
            + '?event='
            + event
            + '&country='
            + localization
            + '&data_begin='
            + date_begin
            + '&data_end='
            + date_end;
    }
    else {
        var link = $(location).attr('origin')
            + '?event='
            + event
            + '&country='
            + localization;
    }
    $('#link-text-share').val(link);
}

function request_api() {
    let event = $("#select-event option").filter(":selected").val();
    let location = $("#item-location input[type='radio']:checked").val();
    let date_begin = $("#date-begin").val();
    let date_end = $("#date-end").val();

    if (date_begin > date_end) alert("Por favor, insira uma data final maior que a data inicial!");
    
    var url = 'get_database_search?event=' + event + '&country=' + location;
    if ($("#date-begin").val() != '') {
        url = url + '&data_begin=' + date_begin + '&data_end=' + date_end;
    }
    $.get(url).done(response_api);
}

$(document).ready(function() {
    map = L.map('map').setView([0, 0], 2);

    L.esri.basemapLayer('Gray').addTo(map);

    $.getJSON("static/countrie.json").done(fill_countries_map);

    $.getJSON("static/estates.json").done(fill_estates_map);

    $.getJSON("get_database_events").done(fill_select_events);

    // Make the DIV element draggable:
    dragElement(document.getElementById("search"));

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "-title")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "-title").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV: 
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            if ((elmnt.offsetTop - pos2) >= 0) {
                if ((elmnt.offsetTop - pos2 + $("#search").height()) <= $(document).height()) {
                    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                }
                else {
                    elmnt.style.top = ($(document).height() - $("#search").height()) + "px";
                }
            }
            else {
                elmnt.style.top = "0px";
            }

            if ((elmnt.offsetLeft - pos1) >= 0) {
                if ((elmnt.offsetLeft - pos1 + $("#search").width()) <= $(document).width()) {
                    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                }
                else {
                    elmnt.style.left = ($(document).width() - $("#search").width()) + "px";
                }
            }
            else {
                elmnt.style.left = "0px";
            }
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});

$( window ).resize(function() {
    $('.list-links').height($('#links').height() - $('#close-links').height() - 20);
});