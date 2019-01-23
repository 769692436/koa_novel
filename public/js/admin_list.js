layui.use('table', function(){
  var table = layui.table;
  table.render({
    elem: '#admin-list',
    url: '/admin/list',
    page: true,
    cols: [[
      {type: 'checkbox'},
      {field: '_id', hide: true, fixed: 'left'},
      {field: 'username', title: '管理员用户名'},
      {title: '操作', toolbar: '#admin-toolbar'}
    ]],
    parseData: function(res) {
      return {
        'code': res.status,
        'message': res.msg,
        'count': res.count,
        'data': res.data
      }
    }
  })
});
