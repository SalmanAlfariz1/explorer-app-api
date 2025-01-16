//import prisma client
import { file } from "bun";
import prisma from "../../prisma/client";
import { unlinkSync } from "node:fs";
import { mkdir, rm, rename } from "node:fs/promises";
import path from "node:path";

async function getFolderPath(folderId: number | null): Promise<string> {
    if (!folderId) {
        // Jika folderId null, berarti ini adalah folder root
        return path.join(process.cwd(), 'files');
    }

    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { name: true, parentId: true }, // Ambil nama folder dan parentId
    });

    if (!folder) {
        throw new Error('Folder not found');
    }

    // Bangun path dari parent folder ke folder saat ini
    const parentPath = await getFolderPath(folder.parentId);
    return path.join(parentPath, folder.name);
}

/**
 * Creating a folder
 */
export async function addFile(id: string, options: { name: string, file_upload: File }) {
    try {
        const folder_Id = parseInt(id);
        const { name, file_upload } = options

        //cek folder
        const folder = await prisma.folder.findFirst({
            where: { id: folder_Id }
        })
        if (!folder) {
            return {
                sucess: true,
                message: "Anda harus memilih folder!"
            }
        }

        //cek nama file
        const fileName = await prisma.file.findFirst({
            where: { folderId: folder_Id, name: name }
        })
        if (fileName) {
            return {
                sucess: false,
                message: "Nama Folder sudah ada!"
            }
        }

        // add folder dari sistem file
        // Bangun path lengkap untuk folder baru
        const folderPath = await getFolderPath(folder_Id);
        const fullPath = path.join(folderPath, name);
        const newFileName = `${fullPath}.${file_upload.type.split('/')[1]}`;
        await Bun.write(newFileName, file_upload);

        //add file
        const file = await prisma.file.create({
            data: {
                name: name,
                folderId: folder_Id,
                size: file_upload.size,
                fileType: file_upload.type.split('/')[1],
                file_upload: newFileName
            }
        })
        return {
            success: true,
            message: "Add File Successfully!",
            data: file
        };

    } catch (e: unknown) {
        console.error(`Error add file: ${e}`);
    }
}



/**
 * Update a folder
 */
export async function updateFile(id: string, idFile: string, options: { name: string, file_upload: File }) {
    try {
        const folder_Id = parseInt(id);
        const File_Id = parseInt(idFile);
        const { name, file_upload } = options
        const baseDir = "files/";

        //cek folder
        const folder = await prisma.folder.findFirst({
            where: { id: folder_Id }
        })
        if (!folder) {
            return {
                sucess: true,
                message: "Anda harus memilih folder!"
            }
        }

        //get file by id
        const file = await prisma.file.findUnique({
            where: { id: File_Id, folderId: folder_Id },
        });
        //if file not found
        if (!file) {
            return {
                sucess: true,
                message: "Detail file Not Found!"
            }
        }

        //cek nama file
        const fileName = await prisma.file.findFirst({
            where: { id: file.id, name: name }
        })
        if (fileName) {
            return {
                sucess: false,
                message: "Nama File sudah ada!"
            }
        }

        const oldPath = await getFolderPath(folder_Id);
        const path = `${file.file_upload}`;
        unlinkSync(path)
        const newFileName = `${oldPath}/${name}.${file_upload.type.split('/')[1]}`;
        await Bun.write(newFileName, file_upload);

        //add file
        const fileUpdate = await prisma.file.update({
            where: { id: File_Id },
            data: {
                name: name,
                folderId: folder_Id,
                size: file_upload.size,
                fileType: file_upload.type.split('/')[1],
                file_upload: newFileName
            }
        })
        return {
            success: true,
            message: "Add File Successfully!",
            data: fileUpdate
        };

    } catch (e: unknown) {
        console.error(`Error add file: ${e}`);
    }
}

/**
* Deleting a folder
*/
export async function deleteFile(id: string) {
    try {

        // Konversi tipe id menjadi number
        const fileId = parseInt(id);

        //get file by id
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });
        //if file not found
        if (!file) {
            return {
                sucess: true,
                message: "Detail file Not Found!"
            }
        }

        const path = `${file.file_upload}`;
        unlinkSync(path)

        //delete file with prisma
        await prisma.file.delete({
            where: { id: fileId },
        });

        //return response json
        return {
            success: true,
            message: "File Deleted Successfully!",
        }
    } catch (e: unknown) {
        console.error(`Error deleting folder: ${e}`);
    }
}


/**
 * klik file
 */
export async function klikFile(id: string) {
    try {

        // Konversi tipe id menjadi number
        const folderId = parseInt(id);

        //get file by id
        const files = await prisma.file.findMany({
            where: { folderId: folderId }
        });

        //if folder not found
        if (!files) {
            return {
                sucess: true,
                message: "Detail Data File Not Found!",
                data: null,
            }
        }
        //return response json
        return {
            success: true,
            message: `Detail Data File By Folder`,
            data: files.map((file) => ({
                ...file
            }))
        }
    } catch (e: unknown) {
        console.error(`Error finding folder: ${e}`);
    }
}