module.exports = function (plop) {
    const glob = require('glob');
    const path = require('path');
    const files = glob.sync('template/**/*.*', { cwd: __dirname});
    // console.log(111, __dirname);
    // create your generators here
    plop.setGenerator('controller', {
        description: 'application controller logic',
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'controller name please'
        }],
        actions(obj) {
            const actions = [];
            files.forEach(file => {
                let ph = file.slice(9);
                let p = path.join(process.cwd(), obj.name, ph)
                let tmp = {
                    type: 'add',
                    path: p,
                    templateFile: file
                };

                actions.push(tmp);
            })
            // console.log(actions);

            return actions;
        }
    });
};