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

function getSourceSize(source)
{
	if (typeof(source) === 'undefined')
		throw new Error('No source name for size.');
	if (!(source in subsystemSizes.results))
		throw new Error('No source for ' + name + '.');
	return subsystemSizes.results[source];
}

function getSourceSizes(name)
{
	const subsystem = getSubsystem(name);
	let bytes = 0;
	for (const source of subsystem.sources)
		bytes += getSourceSize(source);
	return bytes;
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

	/* Pretty-print its source code. */

	const code = document.getElementById('code-box');
	code.innerHTML = article.article.xml;
	code.querySelectorAll('pre code').forEach((el) => {
		hljs.highlightElement(el);
	});

	/* The system name (e.g., FreeBSD) or empty. */

	const sys = document.getElementById('code-system');
	if ('system' in article.keys) {
		let elem;
		if ('system-link' in article.keys) {
			elem = document.createElement('a');
			elem.href = article.keys['system-link'];
		} else
			elem = document.createElement('span');
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
		const kb = Number(getSourceSize(nuri) / 1000).toFixed();
		size.textContent = '...' + kb + ' KB';
	}
	if (refs.length === 0) {
		const elem = document.createElement('li');
		elem.textContent = 'No resources given.';
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
function redrawColumn(subsystem, key, keys)
{
	const text = (key in keys) ? keys[key] : '';
	const link = (key === 'subsystem' && 'link' in subsystem) ?
		subsystem['link'] : (key + '-link' in keys) ?
		keys[key + '-link'] : null;
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
		const row = document.createElement('div');
		row.className = 'table-row';
		for (const key of columnOrder)
			row.append(redrawColumn(subsys, key, article.keys));
		const col = document.createElement('div');
		col.innerHTML = '<i class="fa fa-fw fa-folder-open"></i>';
		col.title = 'view code';
		col.className = 'opener';
		col.onclick = () => drawDialog(article);
		row.append(col);
		rows.push(row);
	}
	document.getElementById('table-body').replaceChildren(...rows);
}

/**
 * Draw the scatter chart plotting complexity.  On the x-axis, show line numbers
 * for the example.  On the y-axis, accumulate the reference complexity.
 */
function drawCasestudy()
{
	const data = {
		labels: Object.keys(casestudy),
		datasets: [{
			label: 'Source code',
			data: Object.keys(casestudy).map(key => casestudySizes.results[casestudy[key]]),
		}, {
			label: 'Resources',
			data: Object.keys(casestudy).map(key => getSourceSizes(key)),
			yAxisID: 'y2',
		}]
	};

	/* Chart.js configuration. */

	new Chart(document.getElementById('chart-casestudy'), {
		type: 'bar',
		data: data,
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
						color: '#fff',
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
						text: 'resources',
						color: '#fff',
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
	for (const subsystem in subsystems) {
		subsystemIndex[subsystem] = i++;
		datasets.push({
			label: subsystem,
			data: [],
		});
	}

	/* Put all examples into their subsystem dataset. */

	for (const article of data.articles) {
		const name = article.keys['subsystem'];
		const bytes = getSourceSizes(name);
		datasets[subsystemIndex[name]].data.push({
			'x': article.keys.lines,
			'y': parseInt(bytes),
		});
	}

	/* Chart.js configuration. */

	new Chart(document.getElementById('chart'), {
		type: 'scatter',
		data: {
			datasets: datasets,
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
					title: {
						display: true,
						text: 'resources',
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
}

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
	document.getElementById('table-head-box').replaceChildren(...cols);
	redraw();
});

