import { CKEditor } from "@ckeditor/ckeditor5-react";
import axios from 'axios';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import React, {useState} from 'react'
import { post, postUpload } from "./common";


type Props = {
    onChange: (value: any) => void;
}

const Editor : React.FC<Props> = ({onChange}) => { // (1)
    const [flag, setFlag] = useState(false);

    const customUploadAdapter = (loader:any) => { // (2)
        return {
            upload(){
                return new Promise ((resolve, reject) => {
                    const data = new FormData();
                     loader.file.then( (file:any) => {
                            console.log(loader.file);
                            const data = new FormData();
                            data.append('upload' , file);
                            postUpload('/common/imageUpload', data)
                                .then((res) => {
                                    if(!flag){
                                        setFlag(true);
                                        onChange(res);
                                        //setImage(res.data.filename);
                                        console.log(res, '리턴데이터확인');
                                    }
                                    //여기서 데이터저장 해야함
                                    //console.log(res, '리턴데이터확인');
                                    resolve({
                                        default: res
                                    });
                                })
                                .catch((err)=>reject(err));
                        })
                })
            }
        }
    }

    function uploadPlugin (editor:any){ // (3)
        editor.plugins.get('FileRepository').createUploadAdapter = (loader:any) => {
            return customUploadAdapter(loader);
        }
    }


    return (
        <CKEditor
            editor={ClassicEditor}
            config={{ // (4)
                extraPlugins: [uploadPlugin]
            }}
            data=""
            onReady={editor => {
                // console.log('Editor is ready to use!', editor);
            }}
            onChange={(event, editor) => {
                console.info(editor.plugins.get('FileRepository'));
                const data = editor.getData();
                onChange(data);
                //setDesc(data);
                //console.log(desc);
            }}
            onBlur={(event, editor) => {
                // console.log('Blur.', editor);
            }}
            onFocus={(event, editor) => {
                // console.log('Focus.', editor);
            }}/>
    )
}

export default Editor