window.uiHandlers.onLoad(function() {

	$('[data-chartjs]', this).each(function(){
		let $chart = $(this);
		let $canvas = $('<canvas></canvas>').appendTo($chart);
		let context = $canvas[0].getContext('2d');
		let chartData = [];

		if ($chart.data('chartjs-var')) {
			chartData = window[$chart.data('chartjs-var')];
		}

		let chart = new Chart(context, {
			type: 'bar',
			data: chartData,
			options: {
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: {
						display: false
					},
				},
				datasets: {
					bar: {
						categoryPercentage: 0.9,
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							font: {
								size: 11
							}
						}
					},
					x: {
						ticks: {
							autoSkipPadding: 2,
							labelOffset: -2,
							font: {
								size: 11
							}
						}
					}
				}
			}
		});
	});


});
