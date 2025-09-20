<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Document;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = Document::all();
        return Inertia::render('HR/Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function create()
    {
        $users = \App\Models\User::select('id', 'name')->orderBy('name')->get();
        return Inertia::render('HR/Documents/Create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'file_path' => 'required|file',
            'owner_id' => 'required|exists:users,id',
            'type' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        if ($request->hasFile('file_path')) {
            $file = $request->file('file_path');
            $path = $file->store('documents', 'public');
            $data['file_path'] = $path;
        }
        Document::create($data);
        return redirect()->route('hr.documents.index')->with('success', 'Document created.');
    }

    public function show(Document $document)
    {
        return Inertia::render('HR/Documents/Show', [
            'document' => $document,
        ]);
    }

    public function edit(Document $document)
    {
        $users = \App\Models\User::select('id', 'name')->orderBy('name')->get();
        return Inertia::render('HR/Documents/Edit', [
            'document' => $document,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Document $document)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'file_path' => 'nullable|file',
            'owner_id' => 'required|exists:users,id',
            'type' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        if ($request->hasFile('file_path')) {
            $file = $request->file('file_path');
            $path = $file->store('documents', 'public');
            $data['file_path'] = $path;
        } else {
            unset($data['file_path']);
        }
        $document->update($data);
        return redirect()->route('hr.documents.index')->with('success', 'Document updated.');
    }

    public function destroy(Document $document)
    {
        $document->delete();
        return redirect()->route('hr.documents.index')->with('success', 'Document deleted.');
    }
}
