$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  // changes theme
  const $body = $('body');

  // По умолчанию тёмная тема
  if (localStorage.getItem('theme') === 'light') {
    $body.addClass('light-theme');
  }

  // Клик по кнопке — переключение темы
  $('#theme-toggle').on('click', function () {
    $body.toggleClass('light-theme');

    if ($body.hasClass('light-theme')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
  });
});
