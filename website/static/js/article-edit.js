$(function () {
  var editor = editormd("editormd", {
    path : "/static/js/editor/lib/", // Autoload modules mode, codemirror, marked... dependents libs path
    height: 640,
    toolbarIcons: 'simple'
  });
});