function getExtrctedData() {
    const repoUrl = document.getElementById("repo-url").value;
    if (!repoUrl || !repoUrl.includes('github.com')) {
        alert('Please enter a valid GitHub repository URL');
        return;
    }
    const user = repoUrl.split('/')[3];
    const repo = repoUrl.split('/')[4];
    const dir = repoUrl.split('/').slice(7).join('/');
    let btn = document.getElementById('extract-btn');
    btn.style.backgroundColor = '#6c757d';
    fetch(`https://api.github.com/repos/${user}/${repo}/contents/${dir}`)
        .then((response) => response.json())
        .then((data) => {
            const json = [];

            data.forEach((item) => {
                const subject_code = item.name.split(" - ")[0];
                const subject_name = item.name.split(" - ")[1];
                const url = item.html_url;
                let type;
                let pyp;
                if (/\.[^/.]+$/.test(item.name)) {
                    type = "file";
                    pyp = false;
                } else if (subject_code.match(/[a-zA-Z]/g && /[0-9]/g)) {
                    type = "subject";
                    pyp = true;
                } else {
                    type = "miscellaneous";
                    pyp = false;
                }

                json.sort((a, b) => {
                    const typeOrder = { miscellaneous: 0, subject: 1, file: 2 };
                    const aType = a.type;
                    const bType = b.type;

                    if (aType !== bType) {
                        return typeOrder[aType] - typeOrder[bType];
                    } else if (aType === "subject") {
                        return a.subject_code.localeCompare(b.subject_code);
                    } else if (aType === "file") {
                        return a.url.localeCompare(b.url);
                    } else {
                        return 0;
                    }
                });

                json.push({
                    type: type,
                    pyp: pyp,
                    subject_code: subject_code,
                    subject_name: subject_name,
                    url: url,
                });
            });
            document.getElementById("json").value = JSON.stringify(json, null, 2);
            createMarkdown(json);
            btn.style.backgroundColor = '#007bff';
        });
}

function createMarkdown(data) {
    let markdown = "| Subject Code | Subject Name | PPTs/Notes/Books | Previous Year Paper |\n";
    markdown += "|--------------|--------------|------------|---------------------|\n";

    data.forEach((item) => {
        const { subject_code, subject_name, url, type, pyp } = item;
        const bookType = type === "subject" ? "📙" : "📘";
        markdown += `| ${subject_code && type === "subject" ? subject_code : ""} | [${subject_name ? subject_name : type === "subject" || type === "miscellaneous" || type === "file" ? subject_code : ""
            }](${url}) | ${bookType} | ${pyp ? "📃" : "❌"} |\n`;
    });
    document.getElementById("markdown").value = markdown;
}
