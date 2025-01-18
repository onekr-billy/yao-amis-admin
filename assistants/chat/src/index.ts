import { getWebPageContent, truncateText } from '@lib/web';
import { getWeatherByName } from '@scripts/app/weather/tool';
import { neo } from '@yao/neo';
import { Process } from '@yaoapps/client';

/**
 * user request -> [init hook] -> stream call -> openai
 *
 * called before the chat with openai.
 *
 * @param context The context object containing session information and other relevant data.
 * @param input The input message array.
 * @param option A payload object containing additional options or data.
 * @returns A response object containing the next action, input messages, and output data.
 */
export function Init(
  context: neo.Context,
  input: neo.Message[],
  writer: neo.ResponseWriter
): neo.ResHookInit {
  // input: [
  //     {
  //       text: "Hello, I'm a bot.", //text content
  //       type: 'text', //error, text, plan, table, form, page, file, video, audio, image, markdown, json ...
  //       role: 'system', //user, assistant, system ...
  //       name: 'system', //name for the message
  //       props: {
  //         // props for the types
  //         type: 'text',
  //         payload: {
  //           type: 'text'
  //         }
  //       },
  //       done: true,
  //       actions: [
  //         // Conversation Actions for frontend
  //         {
  //           type: 'button',
  //           name: 'button1',
  //           payload: {}
  //         }
  //       ],
  //       attachments: [
  //         //File attachments
  //         {
  //           name: 'file1',
  //           url: 'https:',
  //           type: 'file',
  //           content_type: 'image/png',
  //           bytes: 123,
  //           created_at: new Date().getTime(),
  //           file_id: '',
  //           chat_id: context.chat_id,
  //           assistant_id: context.assistant_id
  //         },
  //         {
  //           name: 'file1',
  //           url: 'https:',
  //           type: 'URL',
  //           content_type: 'image/png',
  //           bytes: 123,
  //           created_at: new Date().getTime(),
  //           file_id: '',
  //           chat_id: context.chat_id,
  //           assistant_id: context.assistant_id
  //         }
  //       ]
  //     }
  //   ],

  //case 1 return null
  //return null

  //case 2 returns a string,change the assistant_id
  //return "assignment_id"
  //check if the last message in input attachment with type URL

  // Get the last message in the input array
  const lastMessage = input[input.length - 1];
  input.pop();
  // Check if the last message has attachments
  if (lastMessage.attachments && lastMessage.attachments.length > 0) {
    // Check if any attachment has the type 'URL'
    lastMessage.attachments.forEach((attachment) => {
      if (attachment.type === 'URL' && attachment.url) {
        // console.log('attachment');
        // console.log(attachment);
        try {
          Process('neo.write', writer, [
            { text: '读取网页' + attachment.url + '\n' }
          ]);
          const content = getWebPageContent(attachment.url);
          Process('neo.write', writer, [
            { text: '读取网页完成' + attachment.url + '\n' }
          ]);
          Process('neo.write', writer, [
            { text: truncateText(content) + '\n\n' }
          ]);
          // console.log('content');
          // console.log(content);
          input.push({
            role: 'user',
            text: content,
            type: 'text'
          });
        } catch (error) {
          Process('neo.write', writer, [
            { text: '异常：' + error.message + '\n' }
          ]);
        }
      }
    });
  }
  // get the assistant_id from the message text where it looks  "@xxxxx"
  const mentenion_assistant_id = lastMessage.text?.match(/@(\w+)/)?.[1];
  let new_assistant_id = context.assistant_id;

  if (
    mentenion_assistant_id &&
    mentenion_assistant_id !== context.assistant_id
  ) {
    new_assistant_id = mentenion_assistant_id;
  }

  input.push(lastMessage);
  // console.log('new_assistant_id');
  // console.log(new_assistant_id);

  //case 3 returns an object
  return {
    assistant_id: new_assistant_id, //optional,change the assistant_id,switch the assistant for following process
    chat_id: context.chat_id, //optional
    // next: {
    //   //optional, if you want to call another action in frontend
    //   action: 'assistant', //call other assistant set to 'exit' to exit process
    //   payload: {
    //     assistant_id: new_assistant_id,
    //     input: input,
    //     options: {
    //       max_tokens: 8192
    //     }
    //   }
    // },
    input: input //optional,overwrite the input messages
    // options: {
    //   max_tokens: 8192
    //   //optional, if you want to change the options for openai api call
    // }
  };
}

/**
 * called every time when the call openai api stream happen
 *
 * @param context context info
 * @param input input messages
 * @param output output messages
 * @param writer writer for response
 * @returns {next,output}
 */
function Stream(
  context: neo.Context,
  input: neo.Message[],
  output: string,
  toolcall: boolean
): neo.ResHookStream | null {
  // case 1 return null,no change
  // return null
  return null;
  // case 2 return object
  return {
    silent: false, // set true to continue the stream without output
    next: {
      action: 'process', //set to 'exit' to exit stream
      payload: {
        name: 'get_webpage',
        args: '{"url":"https://www.baidu.com"}'
      }
    }
    // output: output //change the output message
  };
}
interface FunctionCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}
/**
 * called only once, when the call openai api done,open ai return messages
 *
 * @param context context info
 * @param input input messages
 * @param output messages
 * @param writer for response
 * @returns
 */
function Done(
  context: neo.Context,
  input: neo.Message[],
  output: FunctionCall | string,
  toolcall: boolean
): neo.ResHookDone | null | string {
  if (toolcall == true) {
    // let content = {
    //   id: '%s', //return by openai
    //   type: 'function',
    //   function: { name: '%s', arguments: '%s' }
    // };
    // console.log(output);
    let fcall = output as unknown as FunctionCall; //= JSON.parse(output) as FunctionCall;
    if (typeof output == 'string') {
      try {
        fcall = JSON.parse(output) as FunctionCall;
      } catch (error) {
        console.log(error.message);
        return null;
      }
    }
    if (fcall.function.name == 'get_weather') {
      const data = getWeatherByName(fcall.function.arguments['location']);
      // const data = Process(
      //   'scripts.app.weather.init.getWeatherByName',
      //   fcall.function.arguments['location']
      // );
      console.log('get_weather:');
      console.log(data);
      return data;

      // return '{"temperature": "15°C"}';
    } else if (fcall.function.name == 'find_user') {
      console.log('find_user:');
      console.log(fcall.function.arguments);
      return '{"name": "Neo","location": "Beijing"}';
    }

    return '错误的调用，不支持的函数调用：' + fcall.function.name;
  }

  // case 1 return null,no change
  // return null
  return null;
  // case 2 return object
  return {
    next: {
      action: 'action1', //set to 'exit' to exit stream,only set it when you want to exit the process
      payload: {}
    }
    // output: output //change the output message
  };
}

/**
 * called every time when the call openai api failed,open ai return error messages
 *
 * @param context context info
 * @param input input messages
 * @param output output messages
 * @param writer writer for response
 * @returns {next,input,output}
 */
function Fail(
  context: neo.Context,
  input: neo.Message[],
  output: string,
  writer: neo.ResponseWriter
): neo.ResHookFail | null {
  // case 1 return null,no change
  // return null
  return null;
  // case 2 return object
  return {
    // output: output,
    // most important, return error message
    // error: 'error message'
  };
}