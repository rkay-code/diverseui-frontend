$(document).ready(function() {
  var banner = null;
  var $banner = null;

  var status = window.location.search.substring(1);
  var dismissed = _.some(document.cookie.split(';'), function(keypair) {
    return keypair.indexOf('dismissed') !== -1;
  });

  if (status === 'submitted') {
    banner = [
      '<div class="banner success">',
        '<p>Success! Your photo has been submitted for approval.</p>',
        '<span class="close-banner">',
          '<svg width="12" height="12" viewBox="0 0 12 12">',
            '<path d="M7.06 6l4.72-4.72A.75.75 0 0 0 10.72.22L6 4.94 1.28.22A.75.75 0 1 0 .22 1.28L4.94 6 .22 10.72a.75.75 0 1 0 1.06 1.06L6 7.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L7.06 6z" fill-rule="nonzero" fill="#FFF"/>',
          '</svg>',
        '</span>',
      '</div>'
    ];
  } else if (status === 'removed') {
    banner = [
      '<div class="banner">',
        '<p>Your photo has been removed - we\'ll miss you :(</p>',
        '<span class="close-banner">',
          '<svg width="12" height="12" viewBox="0 0 12 12">',
            '<path d="M7.06 6l4.72-4.72A.75.75 0 0 0 10.72.22L6 4.94 1.28.22A.75.75 0 1 0 .22 1.28L4.94 6 .22 10.72a.75.75 0 1 0 1.06 1.06L6 7.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L7.06 6z" fill-rule="nonzero" fill="#FFF"/>',
          '</svg>',
        '</span>',
      '</div>'
    ];
  }

  if (banner) {
    $banner = $(banner.join(''));
    $('.site-body').before($banner);
    $banner.find('.close-banner').on('click', function() {
      if ($banner.hasClass('remember-close')) {
        document.cookie = 'dismissed=true';
      }
      $banner.remove();
    });
  }
});
