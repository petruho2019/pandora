import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));


  // const formData = new FormData();

    // for (let index = 0; index < body.length; index++) {
    //   const tabItem = body[index];
    //   if (!tabItem.isActive) continue;
    //   if(this.isEmptyRow(tabItem)) continue;

    //   if (
    //     tabItem.multipartInfo?.fileValue !== null &&
    //     tabItem.multipartInfo?.fileValue !== undefined
    //   ) {
    //     const fileValue = tabItem.multipartInfo.fileValue;

    //     if (tabItem.multipartInfo?.contentType) {
    //       // Создаем файл с кастомным Content-Type
    //       const customFile = new File(
    //         [fileValue],
    //         fileValue.name,
    //         { type: tabItem.multipartInfo.contentType }
    //       );
    //       formData.append(tabItem.name, customFile, fileValue.name);
    //     } else {
    //       formData.append(tabItem.name, fileValue, fileValue.name);
    //     }
    //   }
    //   else {
    //     // if (tabItem.multipartInfo?.contentType){
    //     //   formData.append(tabItem.name, new Blob([tabItem.value], { type: tabItem.multipartInfo.contentType }));
    //     // }
    //     // else {
    //       formData.append(tabItem.name, tabItem.value);
    //     // } Посмотрел в bruno, ему на кастоный контент тайп именно у НЕ файла все ровно, отправляет без него
    //   }
    // };