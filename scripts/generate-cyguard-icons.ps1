param(
    [string]$OutputDirectory = "client_v2/public/assets"
)

Add-Type -AssemblyName System.Drawing

function New-CyguardBitmap([int]$Size) {
    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
    $bitmap.SetResolution(96, 96)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::FromArgb(5, 7, 11))

    $scale = $Size / 512.0
    $shield = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $points = @(
        [System.Drawing.PointF]::new(256 * $scale, 52 * $scale),
        [System.Drawing.PointF]::new(420 * $scale, 113 * $scale),
        [System.Drawing.PointF]::new(420 * $scale, 232 * $scale),
        [System.Drawing.PointF]::new(420 * $scale, 340 * $scale),
        [System.Drawing.PointF]::new(354 * $scale, 422 * $scale),
        [System.Drawing.PointF]::new(256 * $scale, 462 * $scale),
        [System.Drawing.PointF]::new(158 * $scale, 422 * $scale),
        [System.Drawing.PointF]::new(92 * $scale, 340 * $scale),
        [System.Drawing.PointF]::new(92 * $scale, 232 * $scale),
        [System.Drawing.PointF]::new(92 * $scale, 113 * $scale)
    )
    $shield.AddClosedCurve($points, 0.12)
    $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(90 * $scale, 70 * $scale),
        [System.Drawing.PointF]::new(420 * $scale, 450 * $scale),
        [System.Drawing.Color]::FromArgb(56, 189, 248),
        [System.Drawing.Color]::FromArgb(22, 119, 255)
    )
    $graphics.FillPath($gradient, $shield)

    $markPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(248, 250, 252), [Math]::Max(2, 42 * $scale))
    $markPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $markPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $markPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $box = [System.Drawing.RectangleF]::new(151 * $scale, 147 * $scale, 224 * $scale, 224 * $scale)
    $graphics.DrawArc($markPen, $box, 48, 264)
    $graphics.DrawLine($markPen, 270 * $scale, 259 * $scale, 361 * $scale, 259 * $scale)
    $graphics.DrawLine($markPen, 361 * $scale, 259 * $scale, 361 * $scale, 321 * $scale)

    $markPen.Dispose()
    $gradient.Dispose()
    $shield.Dispose()
    $graphics.Dispose()
    return $bitmap
}

$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\$OutputDirectory"))
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

foreach ($size in @(64, 180, 192, 512)) {
    $bitmap = New-CyguardBitmap $size
    $name = switch ($size) {
        64 { 'favicon.png' }
        180 { 'apple-touch-icon.png' }
        default { "pwa-$size.png" }
    }
    $bitmap.Save((Join-Path $resolvedOutput $name), [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

$iconSizes = @(16, 24, 32, 48, 64, 128, 256)
$frames = foreach ($size in $iconSizes) {
    $bitmap = New-CyguardBitmap $size
    $stream = [System.IO.MemoryStream]::new()
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    $bytes = $stream.ToArray()
    $stream.Dispose()
    [pscustomobject]@{ Size = $size; Bytes = $bytes }
}

$iconPath = Join-Path $resolvedOutput 'favicon.ico'
$file = [System.IO.File]::Create($iconPath)
$writer = [System.IO.BinaryWriter]::new($file)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$frames.Count)
$offset = 6 + (16 * $frames.Count)
foreach ($frame in $frames) {
    $dimension = if ($frame.Size -eq 256) { 0 } else { $frame.Size }
    $writer.Write([byte]$dimension)
    $writer.Write([byte]$dimension)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]32)
    $writer.Write([uint32]$frame.Bytes.Length)
    $writer.Write([uint32]$offset)
    $offset += $frame.Bytes.Length
}
foreach ($frame in $frames) {
    $writer.Write($frame.Bytes)
}
$writer.Dispose()
$file.Dispose()

$snapIconPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\snap\gui\adguard-home-web.png'))
$snapBitmap = New-CyguardBitmap 128
$snapBitmap.Save($snapIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$snapBitmap.Dispose()

Write-Output "Generated CYGUARD PNG and ICO assets in $resolvedOutput and the Snap launcher icon"
