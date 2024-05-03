window.tippyInstances = [];
window.queueTippyInstances = [];

window.onload = function () {
    

    const volumeSlider = document.querySelector('[slider-id="volumeSlider"]');
    const progressSlider = document.querySelector('[slider-id="progressSlider"]');
    $.post("/api/music/get-servers", function (data, status) {
        if (status === "success" && data.status === "success") {
            let serverList = "";
            for (let i = 0; i < data.servers.length; i++) {
                const elem = data.servers[i];
                serverList += `<div class="pos" onclick="setSelectedServer('${elem.id}')"><img src="${elem.iconUrl}" alt="server logo"><span>${elem.name}</span></div>`;
            }
            $(".serverSelectorContainer .serverSelectorWindow .serverList").html(serverList);

            var serverId = "";

            volumeSlider.style.setProperty("--slider-fill-color", "{{altColour}}")

            $.post("/api/music/get-user-server", function (data, status) {
                if (status === "success" && data.status === "success") {
                    $('.center .cover').css({
                        'animation': 'startAnimation ease 2s 1',
                        'width': 0,
                        'height': 0,
                        'opacity': 0,
                        'border-radius': '10px'
                    })
                    $('.center .cover img').css('opacity', 0);

                    if (!data.id) {
                        setTimeout(() => {
                            $('.serverSelectorContainer').css("opacity", "1");
                            $('.serverSelectorContainer .serverSelectorWindow').css({ "pointer-events": "all", "transform": "translateY(0)" });
                        }, 2000);
                    } else {
                        setSelectedServer(data.id);
                    }
                } else {
                    Toastify({
                        text: `{{connectionError}}\n${data.status}`,
                        duration: 3000,
                        newWindow: true,
                        close: true,
                        gravity: "bottom",
                        position: "right",
                        stopOnFocus: true,
                        className: "error"
                    }).showToast();
                }
            })
        } else {
            Toastify({
                text: `{{connectionError}}\n${data.status}`,
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();
        }
    });
}

function logOut() {
    $('.center. cover').css({
        'transition': 'opacity 0.5s',
        'width': '100vw',
        'height': '100vh',
        'opacity': 1
    })
    $('.center .cover img').css({
        'animation': 'none',
        'transition': 'none',
        'opacity': 1,
        'animation': 'loading 1s infinite ease'
    })
    $.post("/api/music/log-out", function (data, status) {
        if (status === "success" && data.status === "success") {
            setTimeout(() => {
                window.location.replace("/");
            }, 2000);
        } else {
            Toastify({
                text: `{{connectionError}}\n${data.status}`,
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();
        }
    })
}

function openServerChangeWindow() {
    $('.serverSelectorContainer .serverSelectorWindow').css({ "opacity": 1, "pointer-events": "all", "transform": "translateY(0)" });
    $('.serverSelectorContainer').css({ "opacity": "1", "pointer-events": "all" });
}

var firstServerChange = true;

function setSelectedServer(id) {
    $('.serverSelectorContainer .serverSelectorWindow').css({ "pointer-events": "none", "opacity": "0.3" });
    $.ajax({
        url: "/api/music/set-user-server", type: "POST", contentType: 'application/json', data: JSON.stringify({ 'target': id }), success: function (result, status) {
            if (status !== "success" || result.status !== "success") {
                Toastify({
                    text: `{{connectionError}}\n${result.status}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "error"
                }).showToast();

                $('.serverSelectorContainer .serverSelectorWindow').css({ "pointer-events": "all", "opacity": "1" });
            } else {
                const progressSlider = document.querySelector('[slider-id="progressSlider"]');
                const volumeSlider = document.querySelector('[slider-id="volumeSlider"]');

                $('.serverSelectorContainer').css({ "opacity": "0", "pointer-events": "none" })
                $('.serverSelectorContainer .serverSelectorWindow').css({ "transform": "translateY(10%)", "pointer-events": "none" })

                Toastify({
                    text: `{{serverChanged}}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "success"
                }).showToast();

                new EventSource('/api/sse/track-data').addEventListener('trackData', function (event) {
                    let data = JSON.parse(event.data);

                    if (data.status === "success") {
                        let track = data.track;
                        if (track.paused) {
                            $('#pause img').attr("src", "/img/play-black.svg")
                        } else {
                            $('#pause img').attr("src", "/img/pause.svg")
                        }
                        $('#currentTrackTitle').html(track.title);
                        $('#currentTrackAuthor').html(track.author);
                        const progressSlider = document.querySelector('[slider-id="progressSlider"]');
                        progressSlider.trackLength = Math.floor(track.durationS);
                        progressSlider.setValue(track.progress);
                        const volumeSlider = document.querySelector('[slider-id="volumeSlider"]');
                        volumeSlider.setValue(track.volume);
                        $('.pbContainer').css({ 'transform': 'translateY(0)', 'pointer-events': 'all' });
                    } else {
                        $('.pbContainer').css({ 'transform': 'translateY(200%)', 'pointer-events': 'none' });
                    }
                });

                // new EventSource('/api/sse/added-song').addEventListener('queueData', function (event) {
                //     let data = JSON.parse(event.data);

                //     let mayRefresh = queueTippyInstances.find((instance) => instance.state.isVisible);

                //     if (!mayRefresh && data.status === "success") {
                //         let queueHTML = "";
                //         for (let i = 0; i < data.tracks.length; i++) {
                //             const track = data.tracks[i];
                //             queueHTML += `<div class="position" id="${Math.random()}" data-url="${track.url}"><div class="left"><div title="${track.title}"><h1>${track.title}</h1></div><div title="${track.author}"><h2>${track.author}</h2></div></div><div class="right"><img src="${track.thumbnail}" alt="thumbnail"></div></div>`;
                //         }

                //         $("#queue").html(queueHTML);
                //         if (firstTimeLoading) {
                //             $(".queueBlock .position").animate({ opacity: 1 }, 500);
                //             firstTimeLoading = false;
                //         }

                //         queueTippyInstances.forEach(instance => {
                //             console.log(instance);
                //             instance.destroy();
                //         });
                //         queueTippyInstances.length = 0;

                //         const instances = tippy('.queueBlock .position', {
                //             allowHTML: true,
                //             trigger: "click",
                //             interactive: true,
                //             arrow: false,
                //             theme: "bardTippy",
                //             animation: "shift-toward-subtle",
                //             appendTo: "parent",
                //             onShow(instance) {
                //                 console.log("shown");
                //                 $(this).children("button").on('click', function() {
                //                     console.log("clicked");
                //                     instance.hide();
                //                 });
                //             },
                //             content: (reference) => {
                //                 const url = $(reference).attr('data-url');

                //                 return $('#queueTippyTemplate').html().replaceAll("[[URL]]", url).replaceAll("[[ELEM_ID]]", reference.id);
                //             },
                //         });
                //         window.queueTippyInstances = queueTippyInstances.concat(instances);
                //         $(".queueBlock .position").css('opacity', 1);
                //     }
                // });
                let queueSource = new EventSource('/api/sse/queue-changes');
                queueSource.addEventListener('songAdded', function (event) {
                    let data = JSON.parse(event.data);

                    console.log("song added");
                    // if (data.status === "success") {
                    if (false) {
                        let posId = Math.random();
                        let track = data.track;
                        for (let i = 0; i < data.tracks.length; i++) {
                            const elem = data.tracks[i];

                            $("#queue").append(`<div class="position" id="${posId}" data-songId="${elem.nodeOptions.songId}" data-url="${elem.url}"><div class="left"><div title="${elem.title}"><h1>${elem.title}</h1></div><div title="${elem.author}"><h2>${elem.author}</h2></div></div><div class="right"><img src="${elem.thumbnail}" alt="thumbnail"></div></div>`);

                            const instances = tippy(`.queueBlock .position#${posId}`, {
                                allowHTML: true,
                                trigger: "click",
                                interactive: true,
                                arrow: false,
                                theme: "bardTippy",
                                animation: "shift-toward-subtle",
                                appendTo: "parent",
                                content: (reference) => {
                                    const url = $(reference).attr('data-url');

                                    return $('#queueTippyTemplate').html().replaceAll("[[URL]]", url).replaceAll("[[ELEM_ID]]", reference.id);
                                },
                            });
                            window.queueTippyInstances = queueTippyInstances.concat(instances);
                        }
                    }
                });
                queueSource.addEventListener('songsRemoved', function (event) {
                    let data = JSON.parse(event.data);

                    if (data.status === "success") {
                        for (let i = 0; i < data.tracks.length; i++) {
                            const elem = data.tracks[i];

                            $("#queue").remove(`.position[data-songId="${elem.nodeOptions.songId}"]`);
                        }

                        window.queueTippyInstances = queueTippyInstances.concat(instances);
                    }
                });

                updateCurrentChannel();
                updateLyrics();

                if (firstServerChange) {
                    firstServerChange = false;

                    setInterval(updateCurrentChannel, 5000);
                    setInterval(updateLyrics, 10000);

                    $("#pause").click(function () {
                        $.post("/api/music/pause", function (data, status) {
                            if (status !== "success" || data.status !== "success") {
                                Toastify({
                                    text: `{{connectionError}}<br>${data.status}`,
                                    duration: 3000,
                                    newWindow: true,
                                    close: true,
                                    gravity: "bottom",
                                    position: "right",
                                    stopOnFocus: true,
                                    className: "error"
                                }).showToast();
                            }
                        });
                    })
                    $("#forwardSkip").click(function () {
                        $.post("/api/music/skip-song", function (data, status) {
                            if (status !== "success" || data.status !== "success") {
                                Toastify({
                                    text: `{{connectionError}}<br>${data.status}`,
                                    duration: 3000,
                                    newWindow: true,
                                    close: true,
                                    gravity: "bottom",
                                    position: "right",
                                    stopOnFocus: true,
                                    className: "error"
                                }).showToast();
                            }
                        });
                    })
                    progressSlider.addChangeEvent(function () {
                        $.ajax({
                            url: "/api/music/seek", type: "POST", contentType: 'application/json', data: JSON.stringify({ target: progressSlider.getSeconds() }), success: function (result, status) {
                                if (status !== "success" || result.status !== "success") {
                                    Toastify({
                                        text: `{{connectionError}}\n${result.status}`,
                                        duration: 3000,
                                        newWindow: true,
                                        close: true,
                                        gravity: "bottom",
                                        position: "right",
                                        stopOnFocus: true,
                                        className: "error"
                                    }).showToast();
                                }
                            }, error: function () {
                                Toastify({
                                    text: "{{connectionError}}",
                                    duration: 3000,
                                    newWindow: true,
                                    close: true,
                                    gravity: "bottom",
                                    position: "right",
                                    stopOnFocus: true,
                                    className: "error"
                                }).showToast();
                            }
                        });
                    })
                    volumeSlider.addChangeEvent(function () {
                        $.ajax({
                            url: "/api/music/set-volume", type: "POST", contentType: 'application/json', data: JSON.stringify({ target: parseInt(this.value) }), success: function (result, status) {
                                if (status !== "success" || result.status !== "success") {
                                    Toastify({
                                        text: `{{connectionError}}\n${result.status}`,
                                        duration: 3000,
                                        newWindow: true,
                                        close: true,
                                        gravity: "bottom",
                                        position: "right",
                                        stopOnFocus: true,
                                        className: "error"
                                    }).showToast();
                                }
                            }, error: function () {
                                Toastify({
                                    text: "{{connectionError}}",
                                    duration: 3000,
                                    newWindow: true,
                                    close: true,
                                    gravity: "bottom",
                                    position: "right",
                                    stopOnFocus: true,
                                    className: "error"
                                }).showToast();
                            }
                        });
                    });
                }
            }
        }, error: function () {
            Toastify({
                text: "{{connectionError}}",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();

            $('.serverSelectorContainer .serverSelectorWindow').css({ "pointer-events": "all", "opacity": "1" });
        }
    });
}

function updateCurrentChannel() {
    $.post("/api/music/get-current-channel", function (data, status) {
        if (status === "success" && data.status === "success") {
            let track = data.channelName;
            $('.channelIndicatorContainer .channelIndicator').attr("title", data.channelName);
            $('.channelIndicatorContainer .channelIndicator span').html(data.channelName);
            $('.channelIndicatorContainer').css('transform', 'translateY(0)');
        } else {
            $('.channelIndicatorContainer').css('transform', 'translateY(-200%)');
        }
    });
}

var mouseOver = false;

function updateLyrics() {
    $.post("/api/music/get-lyrics", function (data, status) {
        if (status === "success" && data.status === "success") {
            $(".lyricsContainer .lyrics").html(data.lyrics.replace(/\n/g, "<br />").replace(/\[+([^\][]+)]+/g, '<span class="header">$1</span>') + `<br><span style="color: rgba(255, 255, 255, 0.6);margin-top: 2rem;display:block;"><a href="${data.source}" target="_blank" style="color: rgba(255, 255, 255, 0.8);">Powered by Genius</a><br>Delivered by Karaokee</span>`)
            if (!mouseOver) {
                setLyricsPos("hidden");
            }
            let track = data.channelName;
            $('.channelIndicatorContainer .channelIndicator').attr("title", data.channelName);
            $('.channelIndicatorContainer .channelIndicator span').html(data.channelName);
            $('.channelIndicatorContainer').css('transform', 'translateY(0)');
        } else {
            setLyricsPos("noTrack");
        }
    });
}

function setLyricsPos(state) {
    if (state === "noTrack") {
        $(".lyricsContainer").css({ "right": "calc(-30vw - 7rem)", "pointer-events": "none" });
        $(".center").css({ "opacity": "1", "mouse-events": "all" });
        mouseOver = false;
    } else if (state === "hidden") {
        $(".lyricsContainer").css({ "right": "calc(-30vw - 1rem)", "pointer-events": "all" });
        $(".center").css({ "opacity": "1", "mouse-events": "all" });
        mouseOver = false;
    } else if (state === "shown") {
        $(".lyricsContainer").css({ "right": "0", "pointer-events": "all" });
        $(".center").css({ "opacity": "0", "mouse-events": "none" });
        mouseOver = true;

    }
}

var firstTimeLoading = true;

function removeFromQueue(elem_id) {
    let elem = document.getElementById(elem_id);
    let parent = elem.parentNode;
    const id = Array.prototype.indexOf.call(parent.children, elem);
    $.ajax({
        url: "/api/music/remove-from-queue", type: "POST", contentType: 'application/json', data: JSON.stringify({ 'target': id }), success: function (result, status) {
            if (status !== "success" || result.status !== "success") {
                Toastify({
                    text: `{{connectionError}}\n${result.status}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "error"
                }).showToast();
            } else {
                Toastify({
                    text: `{{removedFromQueue}}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "success"
                }).showToast();
            }
        }, error: function () {
            Toastify({
                text: "{{connectionError}}",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();
        }
    });
}

var typingTimer;
var doneTypingInterval = 500;
var $input = $('.center input');
var autocompleteOffSet = false;

$input.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

$input.on('keydown', function () {
    if (autocompleteOffSet) setAutocomplete(false);
    clearTimeout(typingTimer);
});

function doneTyping() {
    if ($input.val().length > 0) {
        $.ajax({
            url: "/api/music/autocomplete", type: "POST", contentType: 'application/json', data: JSON.stringify({ 'query': $input.val() }), success: function (result, status) {
                if (status !== "success" || result.status !== "success") {
                    Toastify({
                        text: `{{connectionError}}\n${result.status}`,
                        duration: 3000,
                        newWindow: true,
                        close: true,
                        gravity: "bottom",
                        position: "right",
                        stopOnFocus: true,
                        className: "error"
                    }).showToast();
                } else {
                    tippyInstances.forEach(instance => {
                        instance.destroy();
                    });
                    tippyInstances.length = 0;

                    let res = result.results;
                    let content = "";
                    for (let i = 0; i < res.length; i++) {
                        const track = res[i];
                        content += `<span data-url="${track.url}"><strong>${track.title}</strong> - ${track.author} @ <strong>${track.source}</strong></span>`
                    }
                    $('.suggestions').html(content);

                    const instances = tippy('.suggestions span', {
                        allowHTML: true,
                        trigger: "click",
                        interactive: true,
                        arrow: false,
                        theme: "bardTippy",
                        animation: "shift-toward-subtle",
                        appendTo: "parent",
                        content: (reference) => {
                            const url = reference.getAttribute('data-url');

                            return $('#tippyTemplate').html().replaceAll("[[URL]]", url);
                        },
                    });
                    window.tippyInstances = tippyInstances.concat(instances);

                    setAutocomplete(true);
                    autocompleteOffSet = true;
                }
            }, error: function () {
                Toastify({
                    text: "{{connectionError}}",
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "error"
                }).showToast();
            }
        });
    }
}

function addToQueue(url) {
    $.ajax({
        url: "/api/music/play", type: "POST", contentType: 'application/json', data: JSON.stringify({ 'query': url }), success: function (result, status) {
            if (status !== "success" || result.status !== "success") {
                Toastify({
                    text: `{{connectionError}}\n${result.status}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "error"
                }).showToast();
            } else {
                Toastify({
                    text: `{{addedToQueue}}`,
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "success"
                }).showToast();
            }
        }, error: function () {
            Toastify({
                text: "{{connectionError}}",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();
        }
    });
}

function changeTheme(num) {
    $('.center .cover').css({
        'transition': 'opacity 0.5s',
        'width': '100vw',
        'height': '100vh',
        'opacity': 1,
        'border-radius': 0
    })

    $('.center .cover img').css({
        'animation': 'loading 1s infinite ease',
        'transition': 'none',
        'opacity': 1
    })
    $.ajax({
        url: "/api/misc/change-theme", type: "POST", contentType: 'application/json', data: JSON.stringify({ target: num }), success: function (result, status) {
            if (status !== "success" || result.status !== "success") {
                Toastify({
                    text: `{{connectionError}}\n${result.status}\nReload in 5 seconds`,
                    duration: 10000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    className: "error"
                }).showToast();
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                window.location.reload();
            }
        }, error: function () {
            Toastify({
                text: "{{connectionError}}",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "bottom",
                position: "right",
                stopOnFocus: true,
                className: "error"
            }).showToast();
        }
    });
}

var autocompleteOn = false;
var lastAutocompleteChange = 0;

function setAutocomplete(status) {
    let timeout = 0;
    if (Date.now() - lastAutocompleteChange < 1000) timeout = 1000;
    lastAutocompleteChange = Date.now();
    setTimeout(() => {
        if (!status && autocompleteOn) {
            $('.suggestions span').css({ 'animation': 'autocompleteSpan ease 1 1s', 'opacity': 0 });
            $('.suggestions').css({
                'animation': 'autocomplete ease 1 1s',
                'height': 0,
                'padding': 0,
                'box-shadow': 'none',
                'top': 0,
                'line-height': 0,
                'pointer-events': 'none'
            })
            autocompleteOn = false;
        } else if (status && !autocompleteOn) {
            $('.suggestions span').css({ 'animation': 'autocompleteSpanR ease 1 1s', 'opacity': 1 });
            $('.suggestions').css({
                'animation': 'autocompleteR ease 1 1s',
                'height': '255px',
                'padding': '20px',
                'box-shadow': '0 0 30px 1px rgba(0, 0, 0, 0.6)',
                'top': '1rem',
                'line-height': '2rem',
                'pointer-events': 'all'
            })
            autocompleteOn = true;
        }
        lastAutocompleteChange = Date.now();


    }, timeout);
}