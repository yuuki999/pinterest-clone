import { atom } from 'jotai';

interface Board {
  id: string;
  title: string;
  description?: string;
}

// ボードのデータを保持するatom
export const boardsAtom = atom<Board[]>([]);
// ローディング状態を管理するatom
export const boardsLoadingAtom = atom<boolean>(false);
// ボードの取得状態を管理するatom
export const boardsFetchedAtom = atom<boolean>(false);

/// ボードを取得する関数を持つatom
export const fetchBoardsAtom = atom(
  null,
  async (get, set) => {
    // すでに取得済みの場合は何もしない
    if (get(boardsFetchedAtom)) return;

    try {
      set(boardsLoadingAtom, true);
      const response = await fetch('/api/boards');
      const data = await response.json();
      set(boardsAtom, data);
      set(boardsFetchedAtom, true);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      set(boardsLoadingAtom, false);
    }
  }
);

// 新規ボード作成用のatom
export const createBoardAtom = atom(
  null,
  async (get, set, newBoard: { title: string; description?: string }) => {
    try {
      set(boardsLoadingAtom, true);
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard),
      });
      
      if (response.ok) {
        const createdBoard = await response.json();
        const currentBoards = get(boardsAtom);
        set(boardsAtom, [...currentBoards, createdBoard]);
        return createdBoard;
      }
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    } finally {
      set(boardsLoadingAtom, false);
    }
  }
);
