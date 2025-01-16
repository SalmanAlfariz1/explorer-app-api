//import prisma client
import prisma from "../../prisma/client";
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
 * Getting all folders
 */
export async function getFolders() {
    try {
        //get all folders
        const Folders = await prisma.folder.findMany({ where: { parentId: null }, include: { children: true } });

        //return response json
        return {
            success: true,
            message: "List Data Folders!",
            data: Folders.map((folder) => ({
                ...folder,
                children: folder.children
            }))
        };
    } catch (e: unknown) {
        console.error(`Error getting Folders: ${e}`);
    }
}

/**
 * Creating a folder
 */
export async function createFolder(options: { name: string }) {
    try {

        //get title and content
        const { name } = options;

        //cek nama folder
        const namaFolder = await prisma.folder.findFirst({
            where: { name: name }
        })
        if (namaFolder) {
            return {
                sucess: false,
                message: "Nama Folder sudah ada!"
            }
        }

        // add folder dari sistem file
        const folderPath = path.join(process.cwd(), 'files', name);
        await mkdir(folderPath);

        //create data folder
        const folder = await prisma.folder.create({
            data: {
                name: name
            },
        });

        //return response json
        return {
            success: true,
            message: "Folder berhasil dibuat!",
            data: folder,
        }


    } catch (e: unknown) {
        console.error(`Gagal membuat Folder: ${e}`);
    }
}

/**
 * klik folder
 */
export async function klikFolder(id: string) {
    try {

        // Konversi tipe id menjadi number
        const folderId = parseInt(id);

        //get folders by id
        const folder = await prisma.folder.findUnique({
            where: { id: folderId }
        });

        //get sub folder
        const folders = await prisma.folder.findMany({
            where: { parentId: folderId }
        })

        //get files
        const files = await prisma.file.findMany({
            where: { folderId: folderId }
        })

        //if folder not found
        if (!folder) {
            return {
                sucess: true,
                message: "Detail Data Folder Not Found!",
                data: null,
            }
        }
        //return response json
        return {
            success: true,
            message: `Detail Data Folder By ID : ${id}`,
            data: {
                idFolder: folder.id,
                namaFolder: folder.name,
                folders,
                files
            }
        }
    } catch (e: unknown) {
        console.error(`Error finding folder: ${e}`);
    }
}

/**
 * Updating a folder
 */
export async function updateFolder(id: string, options: { name: string; }) {
    try {

        // Konversi tipe id menjadi number
        const folderId = parseInt(id);
        //get title and content
        const { name } = options;

        //get folder by id
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        //if folder not found
        if (!folder) {
            return {
                sucess: true,
                message: "Detail Data Folder Not Found!",
                data: null,
            }
        }

        // add folder dari sistem file
        // Bangun path lengkap untuk folder baru
        const oldPath = await getFolderPath(folderId);
        const parentPath = await getFolderPath(folder.parentId);
        const newPath = path.join(parentPath, name);
        // Buat folder secara fisik di sistem file
        rename(oldPath, newPath)

        //update folder with prisma
        const folderUpdate = await prisma.folder.update({
            where: { id: folderId },
            data: {
                ...(name ? { name } : {})
            }
        });

        //return response json
        return {
            success: true,
            message: "Folder Updated Successfully!",
            data: folderUpdate
        }
    } catch (e: unknown) {
        console.error(`Error updating folder: ${e}`);
    }
}

/**
* Deleting a folder
*/
export async function deleteFolder(id: string) {
    try {

        // Konversi tipe id menjadi number
        const folder_Id = parseInt(id);
        const baseDir = "files/";

        //get folder by id
        const folder = await prisma.folder.findUnique({
            where: { id: folder_Id },
        });

        //if folder not found
        if (!folder) {
            return {
                sucess: true,
                message: "Detail Data Folder Not Found!"
            }
        }

        // add folder dari sistem file
        // Bangun path lengkap untuk folder baru
        const folderPath = await getFolderPath(folder.parentId);
        const fullPath = path.join(folderPath, folder.name);
        // hapus secara fisik di sistem file
        await rm(fullPath, { recursive: true, force: true });

        //delete folder with prisma
        await prisma.folder.delete({
            where: { id: folder_Id },
        });

        //return response json
        return {
            success: true,
            message: "Folder Deleted Successfully!",
        }
    } catch (e: unknown) {
        console.error(`Error deleting folder: ${e}`);
    }
}


/**
 * Creating a subfolder
 */
export async function createSubFolder(id: string, options: { name: string }) {
    try {

        // Konversi tipe id menjadi number
        const parentId = parseInt(id);
        //get name
        const { name } = options;

        //get folder by id
        const folder = await prisma.folder.findUnique({
            where: { id: parentId }
        });

        //if folder not found
        if (!folder) {
            return {
                sucess: true,
                message: "Folder Not Found!",
                data: null,
            }
        }

        //cek name
        const nameFolder = await prisma.folder.findFirst({
            where: { parentId: parentId, name: name }
        })
        if (nameFolder) {
            return {
                sucess: false,
                message: "Nama File sudah ada!"
            }
        }

        // add folder dari sistem file
        // Bangun path lengkap untuk folder baru
        const folderPath = await getFolderPath(parentId);
        const fullPath = path.join(folderPath, name);
        // Buat folder secara fisik di sistem file
        await mkdir(fullPath, { recursive: true });

        //create data folder
        const subfolder = await prisma.folder.create({
            data: {
                parentId: parentId,
                name: name
            },
        });

        //return response json
        return {
            success: true,
            message: "Folder Created Successfully!",
            data: subfolder,
            console: fullPath
        }
    } catch (e: unknown) {
        console.error(`Error creating Folder: ${e}`);
    }
}