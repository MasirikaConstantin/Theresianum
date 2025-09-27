<?php

require __DIR__.'/vendor/setasign/fpdf/makefont/makefont.php';

// 🔁 Mets le bon chemin vers le fichier TTF
MakeFont(__DIR__ . '/Comfortaa.ttf', 'cp1252');
$d = __DIR__ . '/Comfortaa.ttf';
echo $d . "\n";
