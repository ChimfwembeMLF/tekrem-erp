<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AgileBoardController extends Controller
{
     public function agileBoard()
    {
        return Inertia::render("Projects/AgileBoard");
    }
}
