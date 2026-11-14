/* Bound Apps Script. Configure Script Properties; no credentials or private emails here. */
var REG_HEADERS = ['id','createdAt','name','phone','email','workshop','preferredContact','message','status','note','contactLog','confirmedAt','updatedAt'];
// Owner clarified that this form registers the separate F2 class, not the three workshops.
var REG_CLASSES = {F2: 'Lớp F2'};

function doGet() { return regReply_({ok:true}); }
function doPost(e) {
  try {
    if (!e || !e.postData || typeof e.postData.contents !== 'string' || e.postData.contents.length > 12000) return regReply_({ok:false,error:'invalid_request'});
    var data; try { data=JSON.parse(e.postData.contents); } catch (_) { return regReply_({ok:false,error:'invalid_json'}); }
    if (!data || typeof data!=='object' || Array.isArray(data)) return regReply_({ok:false,error:'invalid_request'});
    if (typeof data.website==='string' && data.website.trim()) return regReply_({ok:true});
    var value=regValidate_(data);
    if (!value) return regReply_({ok:false,error:'invalid_fields'});
    var props=PropertiesService.getScriptProperties();
    var config={sheet:props.getProperty('SPREADSHEET_ID'),email:(props.getProperty('EMAIL_CHU_SITE')||'').trim(),app:(props.getProperty('APP_URL')||'').trim()};
    if (!config.sheet || !regEmail_(config.email) || config.app&&!/^https:\/\/[^\s]+$/.test(config.app)) return regReply_({ok:false,error:'not_configured'});
    var lock=LockService.getScriptLock(),record;
    lock.waitLock(20000);
    try {
      var sheet=regSheet_(SpreadsheetApp.openById(config.sheet));
      var count=sheet.getLastRow(),rows=count>1?sheet.getRange(2,1,count-1,13).getValues():[];
      var now=new Date(),max=Number(props.getProperty('LAST_REGISTRATION_ID')||0)||0;
      for(var i=0;i<rows.length;i++) {
        var match=/^DK(\d+)$/.exec(String(rows[i][0]));if(match)max=Math.max(max,Number(match[1]));
        var elapsed=now.getTime()-new Date(rows[i][1]).getTime();
        if (String(rows[i][3])===value.phone && String(rows[i][5])===value.workshop && elapsed>=0 && elapsed<=600000) return regReply_({ok:true,duplicate:true});
      }
      var id='DK'+String(max+1).padStart(4,'0');
      var createdAt=Utilities.formatDate(now,'Asia/Ho_Chi_Minh',"yyyy-MM-dd'T'HH:mm:ss")+'+07:00';
      record={id:id,createdAt:createdAt,data:value};
      var next=count+1;if(next>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),1);
      // Format the whole phone column as text without rewriting any existing values.
      sheet.getRange(1,4,sheet.getMaxRows(),1).setNumberFormat('@');
      var row=[id,createdAt,regText_(value.name),String(value.phone),regText_(value.email),value.workshop,value.preferredContact,regText_(value.message),'new','','','',''];
      sheet.getRange(next,1,1,13).setValues([row]);
      SpreadsheetApp.flush();
      props.setProperty('LAST_REGISTRATION_ID',String(max+1));
      var phoneCell=sheet.getRange(next,4);
      if (typeof phoneCell.getValue()!=='string' || phoneCell.getValue()!==value.phone || phoneCell.getDisplayValue()!==value.phone) console.error('Registration phone text verification failed');
    } finally { lock.releaseLock(); }
    try { regNotify_(config,record); } catch (_) { console.error('Registration notification email failed'); }
    return regReply_({ok:true,id:record.id});
  } catch (_) { console.error('Registration could not be processed'); return regReply_({ok:false,error:'processing_failed'}); }
}
function regValidate_(data) {
  var out={},keys=['name','phone','email','workshop','preferredContact','message','website'];
  for(var i=0;i<keys.length;i++){var k=keys[i];if(data[k]!==undefined&&typeof data[k]!=='string')return null;out[k]=(data[k]||'').trim();}
  out.phone=out.phone.replace(/[\s()+.\-\u2010-\u2015]/g,'');
  if(!out.name||out.name.length>100||!/^[0-9]{9,11}$/.test(out.phone))return null;
  if(out.email.length>254||out.email&&!regEmail_(out.email)||out.message.length>1000)return null;
  if(!Object.prototype.hasOwnProperty.call(REG_CLASSES,out.workshop))return null;
  out.preferredContact=out.preferredContact||'zalo';
  if(['zalo','phone','email'].indexOf(out.preferredContact)<0)return null;
  return out;
}
function regEmail_(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
function regText_(value){return /^[=+\-@]/.test(value)?"'"+value:value;}
function regSheet_(spreadsheet) {
  var sheet=spreadsheet.getSheetByName('DangKy');if(!sheet)sheet=spreadsheet.insertSheet('DangKy');
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,13).setValues([REG_HEADERS]);
  var header=sheet.getRange(1,1,1,13).getValues()[0];
  if(header.some(function(v,i){return v!==REG_HEADERS[i];}))throw new Error('Unexpected registration headers');
  return sheet;
}
function regNotify_(config,record) {
  var v=record.data,label=REG_CLASSES[v.workshop];
  var contact={zalo:'Zalo',phone:'Điện thoại',email:'Email'}[v.preferredContact];
  var link=config.app?config.app.split('#')[0].replace(/\/$/,'')+'#dang-ky/'+record.id:'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(config.sheet)+'/edit';
  var body=['ID: '+record.id,'Họ tên: '+v.name,'Số điện thoại: '+v.phone,'Email: '+(v.email||'(không có)'),'Lớp: '+label+' ('+v.workshop+')','Liên hệ qua: '+contact,'Lời nhắn: '+(v.message||'(không có)'),'Giờ đăng ký: '+record.createdAt,(config.app?'Mở trong app quản lý: ':'Mở Trang tính: ')+link].join('\n');
  MailApp.sendEmail({to:config.email,subject:'Đăng ký mới: '+v.name.replace(/[\r\n]/g,' ')+' - '+label,body:body});
}
function regReply_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
