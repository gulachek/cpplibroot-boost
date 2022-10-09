const { Command } = require('commander');
const fs = require('fs');

const version = '1.80.0';

const cmd = new Command();
cmd
	.name('gen')
	.description('generate brew boost cpplibroot')
	.version(version);

cmd.command('build')
.argument('library <lib>', 'Name of boost library to generate')
.option('--prefix <prefix>', 'Location of brew prefix')
.action((lib, opts) => {
	const props = require(`./${lib}.json`);

	const libroot = {
		librootVersion: '0.1.0',
		language: props.language,
		includes: [ `${opts.prefix}/include` ],
		version
	};

	for (const isDynamic of [true, false]) {
		const ext = isDynamic ? 'dylib' : 'a';
		const type = isDynamic ? 'dynamic' : 'static';

		if (props.binary) {
			libroot.binary = `${opts.prefix}/lib/libboost_${props.binary}-mt.${ext}`;

			// assume we depend on boost headers
			props.deps.push('headers');
		}

		if (isDynamic && props.dyn_link) {
			libroot.definitions = [
				[props.dyn_link, '']
			];
		} else {
			delete libroot.definitions;
		}

		if (props.deps) {
			libroot.deps = {};

			for (const dep of props.deps) {
				libroot.deps[`org.boost.${dep}`] = { type, version };
			}
		}

		for (const isDebug of [true, false]) {
			const debugType = isDebug ? 'debug' : 'release';
			const fname = `output/${type}_${debugType}.json`;
			fs.writeFileSync(fname, JSON.stringify(libroot));
		}
	}

});

cmd.parse();
