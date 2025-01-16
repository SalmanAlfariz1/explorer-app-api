//import elysia
import { Elysia, t } from 'elysia';

//import controller
import { getFolders, createFolder, klikFolder, updateFolder, deleteFolder, createSubFolder } from '../controllers/FolderController';
import { addFile, deleteFile, klikFile, updateFile } from '../controllers/FileController';

const Routes = new Elysia()

    //route get all folders
    .get('/', () => getFolders())

    //creat folder
    .post('/', ({ body }) => createFolder(body as { name: string }), {
        body: t.Object({
            name: t.String()
        })
    })

    //klik folder
    .get('/:id', ({ params: { id } }) => klikFolder(id))

    //update folder
    .patch('/:id', ({ params: { id }, body }) => updateFolder(id, body as { name: string }), {
        body: t.Object({
            name: t.String()
        })
    })

    //delete folder
    .delete('/:id', ({ params: { id } }) => deleteFolder(id))

    //route create subfolder
    .post('/:id', ({ params: { id }, body }) => createSubFolder(id, body as { name: string }), {
        body: t.Object({
            name: t.String()
        })
    })

    //creat folder
    .post('/file/:id', ({ params: { id }, body }) => addFile(id, body as { name: string, file_upload: File }), {
        body: t.Object({
            name: t.String(),
            file_upload: t.File()
        })
    })

    //update file
    .patch('/file/:id/:idFile', ({ params: { id, idFile }, body }) => updateFile(id, idFile, body as { name: string, file_upload: File }), {
        body: t.Object({
            name: t.String(),
            file_upload: t.File()
        })
    })

    //delete file
    .delete('/file/:id', ({ params: { id } }) => deleteFile(id))

    //klik folder
    .get('/file/:id', ({ params: { id } }) => klikFile(id))

export default Routes;