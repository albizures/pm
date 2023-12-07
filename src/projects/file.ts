import { invoke } from '@tauri-apps/api'
import { exists } from '@tauri-apps/api/fs'

export async function getFileSize(file: string) {
	if (await exists(file)) {
		try {
			const metadata = await invoke('get_folder_size', { path: file })

			return metadata as number
		}
		catch (error) {
			return 0
		}
	}

	return 0
}
