// const handlebars = require("handlebars");
const fs = require("fs");
const path = require("node:path");

module.exports = function (app, client, __dirname, db, lib, lang, oauth) {
    app.get('/test', async (req, res) => {
        if (!await oauth.checkLoggedIn(req)) {
            res.redirect(`/login`);
            return;
        }

        oauth.getUserGuilds(req.session.access_token).then(guilds => {
            req.session.isInGuild = true;
            oauth.getUser(req.session.access_token).then(user => {
                let themeListHTML = "";
                lib.dash.getUserTheme(db, user.id, (theme) => {
                    let allThemes = lib.themes.themeList();
                    for (let i = 0; i < allThemes.length; i++) {
                        const elem = allThemes[i];
                        if (theme.name != elem.name && theme.mainColour1 != elem.mainColour1) {
                            themeListHTML += `<span class="theme unactive" onclick="changeTheme(${i})" data-colour1="${elem.mainColour1}" data-colour2="${elem.mainColour2}" data-colour3="${elem.altColour}">${elem.name}</span>`;
                        } else {
                            themeListHTML += `<span class="theme active">${elem.name}</span>`;
                        }
                    }

                    res.render('test', {
                        helpers: {
                            redirect: process.env.REDIRECT,
                            themeList: themeListHTML,
                            mainColour1: theme.mainColour1,
                            mainColour2: theme.mainColour2,
                            altColour: theme.altColour
                        }
                    });

                    // let template = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates/dashboard.html'), 'utf8'));
                    // res.send(template());
                });

            });
        })
        .catch(err => res.send(lib.dash.constructMessagePage(lang.getText("authorisationError"), 2)));
    });
}