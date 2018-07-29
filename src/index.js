'use strict';

{
    function fetchJSON(url, cb) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status < 400) {
                cb(null, xhr.response);
            } else {
                cb(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
            }
        };
        xhr.onerror = () => cb(new Error('Network request failed'));
        xhr.send();
    }

    function createAndAppend(name, parent, options = {}) {
        const elem = document.createElement(name);
        parent.appendChild(elem);
        Object.keys(options).forEach((key) => {
            const value = options[key];
            if (key === 'html') {
                elem.innerHTML = value;
            } else {
                elem.setAttribute(key, value);
            }
        });
        return elem;
    }

    function main(url) {
        fetchJSON(url, (err, data) => {
            const root = document.getElementById('root');
            if (err) {
                createAndAppend('div', root, {html: err.message, class: 'alert-error'});
            } else {

                const header = createAndAppend('div', root, {class: 'header'});
                createAndAppend('label', header, {html: 'HYF repositories'});
                const repositorySelect = createAndAppend('select', header);
                data.forEach(repo => {
                    createAndAppend('option', repositorySelect, {html: repo.name});
                });

                const left = createAndAppend('div', root, {class: 'left'});
                const right = createAndAppend('div', root, {class: 'right'});

                repositorySelect.addEventListener('change', (event) => {
                    let repo = data.find(r => r.name === repositorySelect.value);
                    left.innerHTML = '';
                    right.innerHTML = '';
                    renderRepo(left, repo);
                    renderContributors(right, repo);
                });

                const repo = data[0];
                renderRepo(left, repo);
                renderContributors(right, repo);

                // createAndAppend('pre', root, {html: JSON.stringify(data, null, 2)});
            }
        });
    }

    function renderRepo(parent, repo) {
        const labelNames = ['name', 'url'];
        labelNames.forEach(labelName => {
            const p = createAndAppend('p', parent);
            createAndAppend('label', p, {html: labelName});
            createAndAppend('span', p, {html: repo[labelName]});
        });
    }

    function renderContributors(parent, repo) {
        const url = repo.contributors_url;
        fetchJSON(url, (err, contributors) => {
            if (err) {
                createAndAppend('div', parent, {html: err.message, class: 'alert-error'});
            } else {

                contributors.forEach(contributor => {
                    const contributorDiv = createAndAppend('div', parent);
                    createAndAppend('img', contributorDiv, {src: contributor.avatar_url})
                });


                // createAndAppend('pre', parent, {html: JSON.stringify(contributors, null, 2)});
            }
        });


    }

    const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

    window.onload = () => main(HYF_REPOS_URL);
}
