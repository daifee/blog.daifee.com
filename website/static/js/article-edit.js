$(function () {
  var $editormd = $('#editormd');
  var height = $(window).height();
  var editorTop = $editormd[0].getBoundingClientRect().top;
  var editorHeight = height - editorTop;

  $editormd.parent().css('height', editorHeight);


  var editor = editormd("editormd", {
    path : "/static/js/editor/lib/", // Autoload modules mode, codemirror, marked... dependents libs path
    height: '100%',
    width: 'auto',
    toolbarIcons: 'mini'
  });
});
