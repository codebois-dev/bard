$(window).on('load', function() {
    tippy('.themes .themeList .theme.unactive', {
        allowHTML: true,
        arrow: false,
        placement: "right",
        theme: "bardTippy",
        animation: "shift-toward-subtle",
        content: (reference) => {
            return $('#themeTippyTemplate').html().replaceAll("[[COLOUR1]]", $(reference).attr("data-colour1")).replaceAll("[[COLOUR2]]", $(reference).attr("data-colour2")).replaceAll("[[COLOUR3]]", $(reference).attr("data-colour3"));
        },
    });
});