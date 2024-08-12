// Problem Definition
// 1. Article Management
//     1. Add Book
//     2. Edit Book
//     3. Search Book
// 2. Member Management
//     1. Add Member
//     2. Edit Member
//     3. Search Member
// 3. Transaction
//     1. Issue A Book
//     2. Return A Book
// 4. Today's due list

import { LibraryInteractor } from './library-interactor';

const libInteractor = new LibraryInteractor();

libInteractor.showMenu();
