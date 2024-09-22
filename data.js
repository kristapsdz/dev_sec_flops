/**
 * All columns in order that we show in the table.  These should reference keys
 * in the article, but they may be undefined in which case the value will just
 * be empty.
 */
const columnOrder = [
	'system',
	'subsystem',
	'lang',
	'lines',
]

/**
 * Generalised function to create a complexity chart over systems or subsystems,
 * but in both cases plotting sources and references.
 */
function chartSourcesRefs(id, tallies, title, d1title, d2title)
{
	new Chart(document.getElementById(id), {
		type: 'bar',
		data: {
			labels: tallies.map(ent => ent.key),
			datasets: [
				{
					label: d1title,
					data: tallies.map(ent => ent.sources),
				}, {
					label: d2title,
					data: tallies.map(ent => ent.refs),
					yAxisID: 'y2',
				},
			],
		},
		options: {
			plugins: {
				legend: {
					title: {
						text: title,
						display: true,
						color: '#fff',
					},
					display: true,
					labels: {
						color: '#fff',
					}
				}
			},
			scales: {
				x: {
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					title: {
						display: true,
						text: 'source code',
						color: '#36a2eb',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y2: {
					position: 'right',
					title: {
						display: true,
						text: 'references',
						color: '#ff6384',
					},
					ticks: {
						color: '#ddd',
						callback: (label, index, labels) => (
							Number(label / 1000) + ' KB'
						),
					},
					grid: {
						color: '#666',
					},
				}
			}
		}
	});
}

function chartContribs(id, tallies, title)
{
	new Chart(document.getElementById(id), {
		type: 'bar',
		data: {
			labels: Object.keys(tallies),
			datasets: [{
				label: title,
				data: Object.keys(tallies).map
					(key => tallies[key].attests),
			}],
		},
		options: {
			plugins: {
				legend: {
					display: true,
					labels: {
						color: '#fff',
					}
				}
			},
			scales: {
				x: {
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					title: {
						display: true,
						text: 'users',
						color: '#36a2eb',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
			}
		}
	});
}

/**
 * Sort the articles by the value of a key property given in "index".  If
 * "numeric" is true, use numeric sorting; otherwise, lexicographic.  If "order"
 * is true, use ascending order; otherwise, descending.  Finally, "elem" is the
 * element which triggered the resort.
 */
function resort(order, elem, index, numeric = false)
{
	data.articles.sort((a, b) => {
		const def = numeric ? 0 : '';
		const vala = index in a.keys ? a.keys[index] : def;
		const valb = index in b.keys ? b.keys[index] : def;
		return (numeric && order) ?
			(Number(vala) - Number(valb)) :
			numeric ?
			(Number(valb) - Number(vala)) :
			order ?
			vala.localeCompare(valb) :
			valb.localeCompare(vala);
	});
	elem.onclick = () => resort(!order, elem, index, numeric);
	redraw();
}

/**
 * Look up a system (e.g., openbsd) , making sure that it exists.
 */
function getSystem(name)
{
	if (typeof(name) === 'undefined')
		return null;
	if (!(name in systems))
		throw new Error('No system for ' + name + '.');
	return systems[name];
}

/**
 * Look up a subsystem (e.g., pledge, capsicum) , making sure that it exists.
 */
function getSubsystem(name)
{
	if (typeof(name) === 'undefined')
		throw new Error('No subsystem name for source entry.');
	if (!(name in subsystems))
		throw new Error('No subsystem for ' + name + '.');
	return subsystems[name];
}

/**
 * Get the size of a specific reference for a subsystem.
 */
function getReferenceSize(reference)
{
	if (typeof(reference) === 'undefined')
		throw new Error('No reference given for size request.');
	if (!(reference in subsystemSizes.results))
		throw new Error('No reference for ' + name + '.');
	return subsystemSizes.results[reference];
}

/**
 * Get the cumulative size of all references for a subsystem.
 */
function getSubsystemReferenceSize(name)
{
	const subsystem = getSubsystem(name);
	let bytes = 0;
	for (const source of subsystem.sources)
		bytes += getReferenceSize(source);
	return bytes;
}

/**
 * Get the cumulative size of all references for an operating system.
 */
function getSourceSystemSizes(name)
{
	const set = new Set();
	for (const article of data.articles)
		if ('system' in article.keys &&
		    article.keys['system'] == name)
			set.add(article.keys['subsystem']);
	let bytes = 0;
	for (const nname of set) {
		const subsystem = getSubsystem(nname);
		for (const source of subsystem.sources)
			bytes += getReferenceSize(source);
	}
	return bytes / set.size;
}

/**
 * The user has clicked on the button so that the dialog for seeing the source
 * code example for "article" shows up.  Populate the dialog window with all
 * necessary information.
 */
function drawDialog(article)
{
	const subsystemName = article.keys['subsystem'];
	const subsystem = getSubsystem(subsystemName);
	const system = getSystem(article.keys['system']);

	/* Pretty-print its source code. */

	const code = document.getElementById('code-box');
	code.innerHTML = article.article.xml;
	code.querySelectorAll('pre code').forEach((el) => {
		hljs.highlightElement(el);
	});

	/* The system name (e.g., FreeBSD) or empty. */

	const sys = document.getElementById('code-system');
	if (system !== null) {
		let elem;
		elem = document.createElement('a');
		elem.href = article.keys['system-link'];
		elem.textContent = article.keys['system'];
		sys.replaceChildren(elem);
		sys.hidden = false;
	} else
		sys.hidden = true;

	/* The subsystem name (e.g., pledge), which is never empty. */

	const subsys = document.getElementById('code-subsystem');
	const subsysName = document.createElement('span');;
	if (subsystem.deprecated !== null) {
		const ico = document.createElement('i');
		ico.className = 'fa fa-fw fa-exclamation-circle';
		subsysName.append(ico);
	}
	if ('link' in subsystem) {
		const anch = document.createElement('a');
		anch.href = subsystem['link'];
		subsysName.append(anch);
	}
	subsysName.append(document.createTextNode(subsystemName));
	subsys.replaceChildren(subsysName);

	/* Code language (e.g., C/C++), also never empty. */

	const lang = document.getElementById('code-lang');
	if ('lang' in article.keys) {
		if (!('system' in article.keys) &&
		    !('subsystem' in article.keys))
			lang.textContent = article.keys['lang'];
		else
			lang.textContent = '(' + article.keys['lang'] + ')';
	} else
		lang.replaceChildren();

	/* All references linked to the subsystem, if any. */

	const refs = [];
	for (const uri of subsystem['sources']) {
		const nuri = uri.trim();
		const elem = document.createElement('div');
		const anch = document.createElement('a');
		elem.append(anch);
		anch.href = nuri;
		anch.textContent = nuri;
		refs.push(elem);
		const size = document.createElement('span');
		elem.append(size);
		const kb = Number(getReferenceSize(nuri) / 1000).toFixed();
		size.textContent = '...' + kb + ' KB';
	}
	if (refs.length === 0) {
		const elem = document.createElement('div');
		elem.textContent = 'No references given.';
		refs.push(elem);
	}
	document.getElementById('code-references').replaceChildren(...refs);

	/* Notes attached to the example, if any. */

	const notes = document.getElementById('code-notes');
	if ('notes' in article.keys) {
		notes.textContent = article.keys.notes;
		notes.className = '';
	} else {
		notes.textContent = 'No notes.';
		notes.className = 'empty';
	}

	/* GitHub reference to the example. */

	document.getElementById('code-github').href = 
		'https://github.com/kristapsdz/dev_sec_flops/blob/main/' +
		article.base + '.md';

	/* Reset the view and show the dialog. */

	const diag = document.getElementById('code');
	const views = diag.getElementsByClassName('code-views');
	for (let i = 0; i < views.length; i++)
		views.checked = false;
	document.getElementById('view-code').checked = true;
	document.getElementById('code-shown').checked = true;
}

/**
 * Draw a table column for the "key" of given article "keys" and within the
 * "subsystem" object.  Return the HTML element.
 */
function redrawCol(subsystem, system, key, keys)
{
	let link = null;
	if (key === 'system' && system !== null && 'link' in system)
		link = system['link'];
	else if (key === 'subsystem' && 'link' in subsystem)
		link = subsystem['link'];

	const text = (key in keys) ? keys[key] : '';
	const col = document.createElement('div');

	if (key === 'subsystem' && subsystem.deprecated !== null) {
		const ico = document.createElement('i');
		ico.className = 'fa fa-fw fa-exclamation-circle';
		ico.title = 'deprecated';
		col.append(ico);
	}

	if (key === 'lines')
		col.className = 'ok-lines';
	if (key === 'lines' && Number(keys[key]) >= 20)
		col.className = 'many-lines';
	if (key === 'lines' && Number(keys[key]) >= 30)
		col.className = 'too-many-lines';

	if (link !== null) {
		const anch = document.createElement('a');
		anch.textContent = text;
		anch.href = link;
		col.append(anch);
	} else
		col.append(document.createTextNode(text));

	if (text.length === 0)
		col.className = 'empty';

	return col;
}

/**
 * Redraw the table of all managed sources.
 */
function redraw()
{
	const rows = [];
	for (const article of data.articles) {
		const subsys = getSubsystem(article.keys['subsystem']);
		const sys = getSystem(article.keys['system']);
		const row = document.createElement('div');
		row.className = 'table-row';
		for (const key of columnOrder)
			row.append(redrawCol(subsys, sys, key, article.keys));
		const col = document.createElement('div');
		col.innerHTML = '<i class="fa fa-fw fa-folder-open"></i>';
		col.title = 'view code';
		col.className = 'opener';
		col.onclick = () => drawDialog(article);
		row.append(col);
		rows.push(row);
	}
	document.getElementById('examples-box').replaceChildren(...rows);
}

/**
 * Draw the scatter chart plotting complexity.  On the x-axis, show line numbers
 * for the example.  On the y-axis, accumulate the reference complexity.
 */
function drawCasestudy()
{
	const links = Object.keys(casestudy).map(key => {
		const elem = document.createElement('div');
		const anch = document.createElement('a');
		elem.append(anch);
		anch.href = casestudy[key];
		anch.textContent = key;
		return elem;
	});
	document.getElementById('casestudy-links').replaceChildren(...links);

	/* Chart.js configuration. */

	const array = Object.keys(casestudy).map(key => ({
		key: key,
		sources: casestudySizes.results[casestudy[key]].lines,
		refs: getSubsystemReferenceSize(key),
	})).sort((a, b) => {
		const srcs = a['sources'] / b['sources'];
		const refs = a['refs'] / b['refs'];
		return ((srcs + refs) / 2) - 1;
	});

	new Chart(document.getElementById('chart-casestudy'), {
		type: 'bar',
		data: {
			labels: Object.keys(casestudy),
			datasets: [
				{
					label: 'Source code',
					data: array.map(key => key.sources),
				}, {
					label: 'References',
					data: array.map(key => key.refs),
					yAxisID: 'y2',
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: true,
					labels: {
						color: '#fff',
					}
				}
			},
			scales: {
				x: {
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					title: {
						display: true,
						text: 'source code',
						color: '#36a2eb',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y2: {
					position: 'right',
					title: {
						display: true,
						text: 'references',
						color: '#ff6384',
					},
					ticks: {
						color: '#ddd',
						callback: (label, index, labels) => (
							Number(label / 1000) + ' KB'
						),
					},
					grid: {
						color: '#666',
					},
				}
			}
		}
	});

	new Chart(document.getElementById('chart-casestudy-history'), {
		type: 'line',
		options: {
			plugins: {
				legend: {
					display: true,
					labels: {
						color: '#fff',
					}
				},
			},
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'year',
					},
					title: {
						display: true,
						text: 'year',
						color: '#fff',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					title: {
						display: true,
						text: 'cumulative commits',
						color: '#fff',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
			}
		},
		data: {
			datasets: Object.keys(casestudy).map(key => {
				const url = casestudy[key];
				let i = 0;
				return {
					label: key,
					data: casestudySizes.results[url].history.map(date => {
						return {
							x: new Date(date).getTime(),
							y: i++,
						};
					}),
				};
			}),
		},
	});
}

/**
 * Draw the scatter chart plotting complexity.  On the x-axis, show line numbers
 * for the example.  On the y-axis, accumulate the reference complexity.
 */
function drawChart()
{
	const datasets = [];

	/* Accumulate subsystems as datasets (same colouring). */

	const subsystemIndex = {};
	let i = 0;
	for (const subsystemName in subsystems) {
		subsystemIndex[subsystemName] = i++;
		datasets.push({
			label: subsystemName,
			data: [],
		});
	}

	/*
	 * Put all examples into their subsystem dataset, then system averages,
	 * then subsystem averages.
	 */

	const subsysTallies = {};
	const sysTallies = {};

	for (const article of data.articles) {
		const subsysName = article.keys['subsystem'];
		const sysName = article.keys['system'];
		const bytes = getSubsystemReferenceSize(subsysName);
		const attests = ('githubAttestations' in article.keys) ?
			article.keys['githubAttestations'].split(',').length :
			0;
		datasets[subsystemIndex[subsysName]].data.push({
			'x': article.keys.lines,
			'y': parseInt(bytes),
		});
		if (!(subsysName in subsysTallies))
			subsysTallies[subsysName] = {
				tally: 0,
				samples: 0,
				attests: 0,
			};
		subsysTallies[subsysName].tally +=
			Number(article.keys.lines);
		subsysTallies[subsysName].samples++;
		subsysTallies[subsysName].attests += attests;
		if (typeof(sysName) === 'undefined')
			continue;
		if (!(sysName in sysTallies))
			sysTallies[sysName] = {
				tally: 0,
				samples: 0,
				attests: 0,
			};
		sysTallies[sysName].tally +=
			Number(article.keys.lines);
		sysTallies[sysName].samples++;
		sysTallies[sysName].attests += attests;
	}

	/*
	 * Begin with the scatter chart, which plots source complexity (x-axis)
	 * to reference complexity (y-axis).
	 */

	new Chart(document.getElementById('chart-scatter'), {
		type: 'scatter',
		data: {
			datasets: datasets,
		},
		options: {
			plugins: {
				legend: {
					display: true,
					align: 'start',
					labels: {
						color: '#fff',
					}
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: 'source code',
						color: '#fff',
					},
					ticks: {
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
				y: {
					display: true,
					position: 'right',
					title: {
						display: true,
						text: 'references',
						color: '#fff',
					},
					ticks: {
						callback: (label, index, labels) => (
							Number(label / 1000) + ' KB'
						),
						color: '#ddd',
					},
					grid: {
						color: '#666',
					},
				},
			}
		}
	});

	/*
	 * Bar graph for average by operating system: for each operating system,
	 * show datasets for the average source and average reference
	 * complexity.
	 */

	const sysTalliesArray = Object.keys(sysTallies).map(key => ({
		key: key,
		sources: sysTallies[key].tally / sysTallies[key].samples,
		refs: getSourceSystemSizes(key),
	})).sort((a, b) => {
		const srcs = a['sources'] / b['sources'];
		const refs = a['refs'] / b['refs'];
		return ((srcs + refs) / 2) - 1;
	});
	
	chartSourcesRefs('chart-systems', sysTalliesArray,
		'complexity by operating system',
		'Average source code', 'Average references');

	/*
	 * Bar graph for average by subsystem: for each subsystem, show datasets
	 * for the average source and reference complexity.
	 */

	const subsysTalliesArray = Object.keys(subsysTallies).map(key => ({
		key: key,
		sources: subsysTallies[key].tally / subsysTallies[key].samples,
		refs: getSubsystemReferenceSize(key),
	})).sort((a, b) => {
		const srcs = a['sources'] / b['sources'];
		const refs = a['refs'] / b['refs'];
		return ((srcs + refs) / 2) - 1;
	});

	chartSourcesRefs('chart-subsystems', subsysTalliesArray,
		'complexity by sandbox subsystem',
		'Average source code', 'References');

	chartContribs('chart-systems-contribs', sysTallies, 'systems');
	chartContribs('chart-subsystems-contribs', subsysTallies, 'subsystems');
}

/**
 * Main drawing routine.  Creates all graphs and tables from our example sources
 * and specifications.
 */
window.addEventListener('load', () => {
	drawChart();
	drawCasestudy();
	const cols = [];
	for (const key of columnOrder) {
		const col = document.createElement('div');
		col.textContent = key;
		const numeric = key === 'lines';
		col.onclick = () => resort(true, col, key, numeric);
		cols.push(col);
	}
	cols.push(document.createElement('div'));
	document.getElementById('examples-columns-box').replaceChildren(...cols);
	redraw();
});

