import {
  app_email_message,
  EmailMessage,
  EmailPluginResponse,
  MessageReceived
} from '@yao/email';
import { Exception, FS, Process } from '@yao/yao';
import { YaoQueryParam } from '@yaoapps/types';

const uploadFolder = 'data/upload/emails';
/**
 * trig by the table after:save hook
 * @param id message id
 * @returns
 */
export function afterSave(id: number) {
  const account = Process('models.app.email.account.find', 1, {});

  const message = Process(
    'models.app.email.message.find',
    id,
    {}
  ) as app_email_message;

  const res = send(message, account);
  if (res.code == 200) {
    Process('models.app.email.message.update', id, {
      status: 'sent',
      sent_at: CurrentTime(),
      send_log: res.message
    });
  } else {
    Process('models.app.email.message.update', id, {
      status: 'failed',
      send_log: res.message
    });
  }
  return id;
}

function send(emailMessage: app_email_message, account: any) {
  const cc = emailMessage.cc.length
    ? emailMessage.cc.split(',')?.map((c) => {
        return { Name: '', Address: c };
      })
    : undefined;
  const to = emailMessage.receiver.split(',')?.map((c) => {
    return { Name: '', Address: c };
  });
  const message = {
    account: {
      ...account
    },
    messages: [
      {
        from: emailMessage.sender,
        to: to, //[{ address: to }, { name: 'vincent1', address: to }],
        cc: cc, //[{ address: username }],
        subject: emailMessage.subject,
        body: emailMessage.content,
        attachments: []
      }
    ]
  } as EmailMessage;
  return Process('plugins.email.send', message) as EmailPluginResponse;
}

/**
 * yao run scripts.app.email.client.receive
 *
 * yao run schedules.mail.start
 */
function receive() {
  console.log('开始接收邮件');
  const account = Process('models.app.email.account.find', 2, {});
  if (!account) {
    console.log('邮件账号未配置');
    return;
  }
  const message = {
    account: {
      ...account
    },
    folder: uploadFolder
  } as EmailMessage;
  const res = Process('plugins.email.receive', message) as EmailPluginResponse;
  if (res.code == 200) {
    saveReceivedEmails(res.emails);
  }
}
/**
 * yao run scripts.app.email.client.saveReceivedEmails
 * @param emails
 */
function saveReceivedEmails(emails: MessageReceived[]) {
  if (!emails) {
    console.log('邮件还没收到');
    return;
    // const fs = new FS('system');
    // const data = fs.ReadFile('/upload/email.json');
    // const res = JSON.parse(data);
    // emails = res.emails;
  }
  if (!Array.isArray(emails) || !emails.length) {
    console.log('邮件还没收到');
    return;
  }
  emails.forEach((mail) => {
    const record = decodeMessage(mail);
    if (record) {
      record.status = 'received';
      record.received_at = CurrentTime();
      const [item] = Process('models.app.email.message.get', {
        limit: 1,
        wheres: [{ column: 'message_id', value: record.message_id }]
      } as YaoQueryParam.QueryParam);
      if (!item) {
        const id = Process('models.app.email.message.create', record);
        if (!id) {
          console.log('保存邮件失败！');
        }
      } else {
        record.id = item.id;
        Process('models.app.email.message.save', record);
      }
      console.log('邮件保存成功:' + record.subject);
    }
  });
}
/**
 * yao run scripts.app.email.client.decodeMessage
 * @param emails
 * @returns
 */
function decodeMessage(email: MessageReceived) {
  if (!email) {
    return null;
  }
  // console.log('email', email);
  const message = {} as any;
  message.type = 'in';
  message.sender = email.from; //发件人
  message.receiver = email.to; //
  message.subject = email.subject; //主题

  message.date = email.date;

  message.message_id = email.message_id;
  message.uid = email.uid;
  // 附件列表
  message.attachments = email.attachments;
  message.attachment_folder = email.folder;

  message.error = email.error;
  if (message.error) {
    return message;
  }

  const text = email.body?.find((b) => b.content_type == 'text/plain');
  message.plain_text = text?.centent;
  // if (text?.content_type_value['charset'].toLowerCase() != 'utf-8') {
  // }
  const html = email.body?.find((b) => b.content_type == 'text/html');
  message.content = html?.centent;
  // if (html?.content_type_value['charset'].toLowerCase() != 'utf-8') {
  // }
  if (message.plain_text == message.content) {
    message.plain_text = '';
  }

  const attachments = email.body?.filter((b) => !!b.saved_file_name) || [];
  const attachmentList = [];

  attachments.forEach((a) => {
    const attachment = {} as any;
    // attachment.content_id = a.content_id;
    attachment.content_type = a.content_type;
    attachment.saved_file_name = a.saved_file_name;
    // attachment.saved_file_path = a.saved_file_path;
    attachment.category = a.disposition; //inline嵌入或是附件
    attachment.filename = a.disposition_value['filename'] || a.attachment;
    attachment.encoding = a.encoding;
    const filePath = a.saved_file_path.replace(uploadFolder, '');
    attachment.download_url = `/api/v1/fs/email/file/download?name=${filePath}`;
    if (a.disposition == 'inline') {
      //replace the cid in html and text
      if (message.content) {
        message.content = message.content.replace(
          `cid:${a.content_id}`,
          attachment.download_url
        );
      }
    }
    attachmentList.push(attachment);
  });

  // 附件清细
  message.attachment_details = attachmentList;
  return message;
}
// decodeMessage();
function CurrentTime() {
  const date = new Date();
  // utc时间整时区
  const newDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );
  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate.toISOString().slice(0, 19).replace('T', ' ');
  // return dateObj.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
}
