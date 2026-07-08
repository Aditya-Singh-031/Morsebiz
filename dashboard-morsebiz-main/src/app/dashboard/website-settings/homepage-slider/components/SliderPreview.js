'use client';

import React from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

const SliderPreview = ({ sliderData, styles: propStyles, getImageUrl, viewMode = 'desktop' }) => {
    // Helper function to convert hex color with opacity to rgba
    const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Get styles with fallbacks - use propStyles first, then fallback to sliderData.styles
    // Support for breakpoint-specific styles
    const rawStyles = propStyles || sliderData.styles || {};
    const styles = viewMode === 'mobile' ? (rawStyles.mobile || rawStyles) : (rawStyles.desktop || rawStyles);

    const overlayStyle = {
        backgroundColor: styles.overlayColor ? hexToRgba(styles.overlayColor, styles.overlayOpacity || 0.3) : 'rgba(0, 0, 0, 0.3)'
    };

    const containerStyle = {
        // Layout properties
        display: styles.container?.display || 'flex',
        flexDirection: styles.container?.flexDirection || 'row',
        flexWrap: styles.container?.flexWrap || 'nowrap',
        justifyContent: styles.container?.justifyContent || 'space-between',
        alignItems: styles.container?.alignItems || 'center',
        gap: styles.container?.gap || '0px',
        // Spacing
        paddingTop: styles.container?.paddingTop || '0px',
        paddingRight: styles.container?.paddingRight || '0px',
        paddingBottom: styles.container?.paddingBottom || '0px',
        paddingLeft: styles.container?.paddingLeft || '0px',
        boxSizing: 'border-box'
    };

    const layoutStyle = {
        leftWidth: styles.layout?.leftWidth || '50%',
        rightWidth: styles.layout?.rightWidth || '50%'
    };

    // Helper function to get proper CSS styles for width including auto
    const getWidthStyle = (width) => {
        if (width === 'auto') {
            return {
                flex: '1 1 auto',
                width: 'auto'
            };
        }
        return {
            flex: `0 0 ${width}`,
            width: width
        };
    };

    const leftContentStyle = {
        paddingTop: styles.leftContent?.paddingTop || '0px',
        paddingRight: styles.leftContent?.paddingRight || '0px',
        paddingBottom: styles.leftContent?.paddingBottom || '0px',
        paddingLeft: styles.leftContent?.paddingLeft || '0px',
        marginTop: styles.leftContent?.marginTop || '0px',
        marginRight: styles.leftContent?.marginRight || '0px',
        marginBottom: styles.leftContent?.marginBottom || '0px',
        marginLeft: styles.leftContent?.marginLeft || '0px',
        boxSizing: 'border-box'
    };

    const rightContentStyle = {
        paddingTop: styles.rightContent?.paddingTop || '0px',
        paddingRight: styles.rightContent?.paddingRight || '0px',
        paddingBottom: styles.rightContent?.paddingBottom || '0px',
        paddingLeft: styles.rightContent?.paddingLeft || '0px',
        marginTop: styles.rightContent?.marginTop || '0px',
        marginRight: styles.rightContent?.marginRight || '0px',
        marginBottom: styles.rightContent?.marginBottom || '0px',
        marginLeft: styles.rightContent?.marginLeft || '0px',
        boxSizing: 'border-box'
    };

    const titleStyle = {
        // Typography
        color: styles.title?.color || '#ffffff',
        fontSize: styles.title?.fontSize || '25px',
        fontWeight: styles.title?.fontWeight || 'bold',
        lineHeight: styles.title?.lineHeight || '1.2',
        letterSpacing: styles.title?.letterSpacing || '0px',
        wordSpacing: styles.title?.wordSpacing || '0px',
        textAlign: styles.title?.textAlign || 'left',
        textTransform: styles.title?.textTransform || 'none',
        textDecoration: styles.title?.textDecoration || 'none',
        // Spacing
        marginTop: styles.title?.marginTop || '0px',
        marginRight: styles.title?.marginRight || '0px',
        marginBottom: styles.title?.marginBottom || '0px',
        marginLeft: styles.title?.marginLeft || '0px',
        paddingTop: styles.title?.paddingTop || '0px',
        paddingRight: styles.title?.paddingRight || '0px',
        paddingBottom: styles.title?.paddingBottom || '0px',
        paddingLeft: styles.title?.paddingLeft || '0px',
        boxSizing: 'border-box'
    };

    const descriptionStyle = {
        // Typography
        color: styles.description?.color || '#e5e5e5',
        fontSize: styles.description?.fontSize || '15px',
        fontWeight: styles.description?.fontWeight || 'normal',
        lineHeight: styles.description?.lineHeight || '1.5',
        letterSpacing: styles.description?.letterSpacing || '0px',
        wordSpacing: styles.description?.wordSpacing || '0px',
        textAlign: styles.description?.textAlign || 'left',
        textTransform: styles.description?.textTransform || 'none',
        textDecoration: styles.description?.textDecoration || 'none',
        // Spacing
        marginTop: styles.description?.marginTop || '0px',
        marginRight: styles.description?.marginRight || '0px',
        marginBottom: styles.description?.marginBottom || '0px',
        marginLeft: styles.description?.marginLeft || '0px',
        paddingTop: styles.description?.paddingTop || '0px',
        paddingRight: styles.description?.paddingRight || '0px',
        paddingBottom: styles.description?.paddingBottom || '0px',
        paddingLeft: styles.description?.paddingLeft || '0px',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        backgroundColor: styles.button?.backgroundColor || '#3b82f6',
        color: styles.button?.color || '#ffffff',
        fontSize: styles.button?.fontSize || '15px',
        fontWeight: styles.button?.fontWeight || '600',
        borderRadius: styles.button?.borderRadius || '8px',
        paddingTop: styles.button?.paddingTop || '10px',
        paddingRight: styles.button?.paddingRight || '25px',
        paddingBottom: styles.button?.paddingBottom || '10px',
        paddingLeft: styles.button?.paddingLeft || '25px',
        marginTop: styles.button?.marginTop || '0px',
        marginRight: styles.button?.marginRight || '0px',
        marginBottom: styles.button?.marginBottom || '0px',
        marginLeft: styles.button?.marginLeft || '0px',
        border: 'none',
        cursor: 'default',
        display: 'inline-block',
        boxSizing: 'border-box'
    };

    const taglineStyle = {
        // Typography
        color: styles.tagline?.color || '#ffffff',
        fontSize: styles.tagline?.fontSize || '10px',
        fontWeight: styles.tagline?.fontWeight || '400',
        lineHeight: styles.tagline?.lineHeight || '1.4',
        letterSpacing: styles.tagline?.letterSpacing || '0px',
        wordSpacing: styles.tagline?.wordSpacing || '0px',
        textAlign: styles.tagline?.textAlign || 'center',
        textTransform: styles.tagline?.textTransform || 'none',
        textDecoration: styles.tagline?.textDecoration || 'none',
        // Background (computed with opacity)
        backgroundColor: styles.tagline?.backgroundColor ?
            hexToRgba(styles.tagline.backgroundColor, styles.tagline?.backgroundOpacity || 0.1) :
            'rgba(255, 255, 255, 0.1)',
        backgroundOpacity: styles.tagline?.backgroundOpacity || 0.1,
        // Border
        borderColor: styles.tagline?.borderColor || '#ffffff',
        borderWidth: styles.tagline?.borderWidth || '0px',
        borderStyle: styles.tagline?.borderStyle || 'solid',
        borderRadius: styles.tagline?.borderRadius || '14px',
        // Spacing
        marginTop: styles.tagline?.marginTop || '0px',
        marginBottom: styles.tagline?.marginBottom || '0px',
        marginLeft: styles.tagline?.marginLeft || '0px',
        marginRight: styles.tagline?.marginRight || '0px',
        paddingTop: styles.tagline?.paddingTop || '8px',
        paddingBottom: styles.tagline?.paddingBottom || '8px',
        paddingLeft: styles.tagline?.paddingLeft || '12px',
        paddingRight: styles.tagline?.paddingRight || '12px',
        gap: styles.tagline?.gap || '0px',
        // Container spacing
        containerMarginTop: styles.tagline?.containerMarginTop || '0px',
        containerMarginBottom: styles.tagline?.containerMarginBottom || '0px',
        containerMarginLeft: styles.tagline?.containerMarginLeft || '0px',
        containerMarginRight: styles.tagline?.containerMarginRight || '0px',
        // Layout settings
        displayType: styles.tagline?.displayType || 'flex',
        flexDirection: styles.tagline?.flexDirection || 'row',
        flexWrap: styles.tagline?.flexWrap || 'wrap',
        justifyContent: styles.tagline?.justifyContent || 'flex-start',
        alignItems: styles.tagline?.alignItems || 'center',
        gridTemplateColumns: styles.tagline?.gridTemplateColumns || 'repeat(auto-fit, minmax(120px, 1fr))',
        gridGap: styles.tagline?.gridGap || '5px',
        rowGap: styles.tagline?.rowGap || '5px',
        columnGap: styles.tagline?.columnGap || '5px',
        // Image styling
        imageWidth: styles.tagline?.imageWidth || '20px',
        imageHeight: styles.tagline?.imageHeight || '20px',
        imageBorderRadius: styles.tagline?.imageBorderRadius || '50%',
        imageObjectFit: styles.tagline?.imageObjectFit || 'cover',
        boxSizing: 'border-box'
    };

    // Background image styles (for fill images, exclude width/height)
    const backgroundImageStyle = {
        objectFit: styles.backgroundImage?.objectFit || 'cover',
        objectPosition: styles.backgroundImage?.objectPosition || 'center'
    };

    // Background image with dimensions (for non-fill images)
    const backgroundImageWithDimensionsStyle = {
        width: styles.backgroundImage?.width || 'auto',
        height: styles.backgroundImage?.height || 'auto',
        objectFit: styles.backgroundImage?.objectFit || 'cover',
        objectPosition: styles.backgroundImage?.objectPosition || 'center'
    };

    // Feature image styles (for fill images, exclude width/height)
    const featureImageStyle = {
        objectFit: styles.featureImage?.objectFit || 'cover',
        objectPosition: styles.featureImage?.objectPosition || 'center'
    };

    // Feature image with dimensions (for non-fill images)
    const featureImageWithDimensionsStyle = {
        width: styles.featureImage?.width || 'auto',
        height: styles.featureImage?.height || 'auto',
        objectFit: styles.featureImage?.objectFit || 'cover',
        objectPosition: styles.featureImage?.objectPosition || 'center'
    };

    // Check if we should use fill or specific dimensions
    // Use fill when width and height are both auto or not specified
    const shouldUseFillForBackground = (!styles.backgroundImage?.width || styles.backgroundImage?.width === 'auto') &&
        (!styles.backgroundImage?.height || styles.backgroundImage?.height === 'auto');
    const shouldUseFillForFeature = (!styles.featureImage?.width || styles.featureImage?.width === 'auto') &&
        (!styles.featureImage?.height || styles.featureImage?.height === 'auto');
    return (
        <div
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
                backgroundColor: styles.backgroundColor ? hexToRgba(styles.backgroundColor, styles.backgroundOpacity || 0.3) : '#f3f4f6'
            }}
        >
            {/* Background Media */}
            {sliderData.bgMedia && (
                <div className="absolute inset-0 z-0">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(sliderData.bgMedia) ? (
                        shouldUseFillForBackground ? (
                            <Image
                                src={getImageUrl(sliderData.bgMedia)}
                                alt="Background"
                                fill
                                style={backgroundImageStyle}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <Image
                                src={getImageUrl(sliderData.bgMedia)}
                                alt="Background"
                                width={parseInt(styles.backgroundImage?.width) || 800}
                                height={parseInt(styles.backgroundImage?.height) || 600}
                                style={backgroundImageWithDimensionsStyle}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )
                    ) : (
                        <video
                            className="w-full h-full"
                            style={backgroundImageWithDimensionsStyle}
                            autoPlay
                            muted
                            loop
                            playsInline
                        >
                            <source src={sliderData.bgMedia} type="video/mp4" />
                        </video>
                    )}
                </div>
            )}

            {/* Overlay - Full Coverage */}
            <div
                className="absolute inset-0 z-20"
                style={overlayStyle}
            ></div>

            {/* Content Layout - Dynamic Flexbox */}
            <div
                className="absolute inset-0 z-30"
                style={{
                    // Layout
                    display: containerStyle.display,
                    flexDirection: containerStyle.flexDirection,
                    flexWrap: containerStyle.flexWrap,
                    justifyContent: containerStyle.justifyContent,
                    alignItems: containerStyle.alignItems,
                    gap: containerStyle.gap,
                    // Spacing
                    boxSizing: containerStyle.boxSizing,
                    padding: `${containerStyle.paddingTop} ${containerStyle.paddingRight} ${containerStyle.paddingBottom} ${containerStyle.paddingLeft}`,
                    margin: '0px 0px 0px 0px'
                }}
            >
                {/* Left Side - Content and Button */}
                <div
                    className="flex flex-col justify-center relative"
                    style={{
                        ...getWidthStyle(layoutStyle.leftWidth),
                        boxSizing: leftContentStyle.boxSizing,
                        margin: `${leftContentStyle.marginTop} ${leftContentStyle.marginRight} ${leftContentStyle.marginBottom} ${leftContentStyle.marginLeft}`,
                        padding: `${leftContentStyle.paddingTop} ${leftContentStyle.paddingRight} ${leftContentStyle.paddingBottom} ${leftContentStyle.paddingLeft}`
                    }}
                >
                    {/* Title */}
                    {sliderData.title && (
                        <h1
                            style={{
                                // Typography
                                color: titleStyle.color,
                                fontSize: titleStyle.fontSize,
                                fontWeight: titleStyle.fontWeight,
                                lineHeight: titleStyle.lineHeight,
                                letterSpacing: titleStyle.letterSpacing,
                                wordSpacing: titleStyle.wordSpacing,
                                textAlign: titleStyle.textAlign,
                                textTransform: titleStyle.textTransform,
                                textDecoration: titleStyle.textDecoration,
                                // Spacing
                                boxSizing: titleStyle.boxSizing,
                                margin: `${titleStyle.marginTop} ${titleStyle.marginRight} ${titleStyle.marginBottom} ${titleStyle.marginLeft}`,
                                padding: `${titleStyle.paddingTop} ${titleStyle.paddingRight} ${titleStyle.paddingBottom} ${titleStyle.paddingLeft}`
                            }}
                        >
                            {sliderData.title}
                        </h1>
                    )}

                    {/* Description */}
                    {sliderData.description && (
                        <p
                            style={{
                                // Typography
                                color: descriptionStyle.color,
                                fontSize: descriptionStyle.fontSize,
                                fontWeight: descriptionStyle.fontWeight,
                                lineHeight: descriptionStyle.lineHeight,
                                letterSpacing: descriptionStyle.letterSpacing,
                                wordSpacing: descriptionStyle.wordSpacing,
                                textAlign: descriptionStyle.textAlign,
                                textTransform: descriptionStyle.textTransform,
                                textDecoration: descriptionStyle.textDecoration,
                                // Spacing
                                boxSizing: descriptionStyle.boxSizing,
                                margin: `${descriptionStyle.marginTop} ${descriptionStyle.marginRight} ${descriptionStyle.marginBottom} ${descriptionStyle.marginLeft}`,
                                padding: `${descriptionStyle.paddingTop} ${descriptionStyle.paddingRight} ${descriptionStyle.paddingBottom} ${descriptionStyle.paddingLeft}`
                            }}
                        >
                            {sliderData.description}
                        </p>
                    )}

                    {/* Taglines */}
                    {sliderData.taglines && sliderData.taglines.length > 0 && (
                        <div
                            style={{
                                // Container Layout
                                display: taglineStyle.displayType,
                                ...(taglineStyle.displayType === 'flex' ? {
                                    flexDirection: taglineStyle.flexDirection,
                                    flexWrap: taglineStyle.flexWrap,
                                    justifyContent: taglineStyle.justifyContent,
                                    alignItems: taglineStyle.alignItems,
                                    gap: taglineStyle.gap
                                } : {
                                    gridTemplateColumns: taglineStyle.gridTemplateColumns,
                                    rowGap: taglineStyle.rowGap,
                                    columnGap: taglineStyle.columnGap
                                }),
                                // Container Spacing
                                marginTop: taglineStyle.containerMarginTop,
                                marginBottom: taglineStyle.containerMarginBottom,
                                marginLeft: taglineStyle.containerMarginLeft,
                                marginRight: taglineStyle.containerMarginRight
                            }}
                        >
                            {sliderData.taglines.slice(0, 3).map((tagline, index) => (
                                <div
                                    key={index}
                                    style={{
                                        // Individual Item Layout
                                        display: 'flex',
                                        alignItems: 'center',
                                        // Typography
                                        color: taglineStyle.color,
                                        fontSize: taglineStyle.fontSize,
                                        fontWeight: taglineStyle.fontWeight,
                                        lineHeight: taglineStyle.lineHeight,
                                        letterSpacing: taglineStyle.letterSpacing,
                                        wordSpacing: taglineStyle.wordSpacing,
                                        textAlign: taglineStyle.textAlign,
                                        textTransform: taglineStyle.textTransform,
                                        textDecoration: taglineStyle.textDecoration,
                                        // Background & Border
                                        backgroundColor: taglineStyle.backgroundColor,
                                        borderColor: taglineStyle.borderColor,
                                        borderWidth: taglineStyle.borderWidth,
                                        borderStyle: taglineStyle.borderStyle,
                                        borderRadius: taglineStyle.borderRadius,
                                        // Spacing
                                        marginTop: taglineStyle.marginTop,
                                        marginBottom: taglineStyle.marginBottom,
                                        marginLeft: taglineStyle.marginLeft,
                                        marginRight: taglineStyle.marginRight,
                                        paddingTop: taglineStyle.paddingTop,
                                        paddingBottom: taglineStyle.paddingBottom,
                                        paddingLeft: taglineStyle.paddingLeft,
                                        paddingRight: taglineStyle.paddingRight,
                                        gap: taglineStyle.gap,
                                        boxSizing: taglineStyle.boxSizing
                                    }}
                                >
                                    {tagline.image && (
                                        <div
                                            style={{
                                                width: taglineStyle.imageWidth,
                                                height: taglineStyle.imageHeight,
                                                borderRadius: taglineStyle.imageBorderRadius,
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Image
                                                src={getImageUrl(tagline.image)}
                                                alt={tagline.text}
                                                width={parseInt(taglineStyle.imageWidth)}
                                                height={parseInt(taglineStyle.imageHeight)}
                                                style={{
                                                    objectFit: taglineStyle.imageObjectFit,
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        </div>
                                    )}
                                    <span>
                                        {tagline.text}
                                    </span>
                                </div>
                            ))}
                            {sliderData.taglines.length > 3 && (
                                <div
                                    style={{
                                        // Typography
                                        color: taglineStyle.color,
                                        fontSize: taglineStyle.fontSize,
                                        fontWeight: taglineStyle.fontWeight,
                                        lineHeight: taglineStyle.lineHeight,
                                        letterSpacing: taglineStyle.letterSpacing,
                                        wordSpacing: taglineStyle.wordSpacing,
                                        textAlign: taglineStyle.textAlign,
                                        textTransform: taglineStyle.textTransform,
                                        textDecoration: taglineStyle.textDecoration,
                                        // Background & Border
                                        backgroundColor: taglineStyle.backgroundColor,
                                        borderColor: taglineStyle.borderColor,
                                        borderWidth: taglineStyle.borderWidth,
                                        borderStyle: taglineStyle.borderStyle,
                                        borderRadius: taglineStyle.borderRadius,
                                        // Spacing
                                        marginTop: taglineStyle.marginTop,
                                        marginBottom: taglineStyle.marginBottom,
                                        marginLeft: taglineStyle.marginLeft,
                                        marginRight: taglineStyle.marginRight,
                                        paddingTop: taglineStyle.paddingTop,
                                        paddingBottom: taglineStyle.paddingBottom,
                                        paddingLeft: taglineStyle.paddingLeft,
                                        paddingRight: taglineStyle.paddingRight,
                                        boxSizing: taglineStyle.boxSizing
                                    }}
                                >
                                    <span>
                                        +{sliderData.taglines.length - 3} more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Button */}
                    {sliderData.buttonText && (
                        <div className="flex relative">
                            <div
                             
                                style={{
                                    backgroundColor: buttonStyle.backgroundColor,
                                    color: buttonStyle.color,
                                    fontSize: buttonStyle.fontSize,
                                    fontWeight: buttonStyle.fontWeight,
                                    borderRadius: buttonStyle.borderRadius,
                                    border: buttonStyle.border,
                                    cursor: buttonStyle.cursor,
                                    display: buttonStyle.display,
                                    boxSizing: buttonStyle.boxSizing,
                                    margin: `${buttonStyle.marginTop} ${buttonStyle.marginRight} ${buttonStyle.marginBottom} ${buttonStyle.marginLeft}`,
                                    padding: `${buttonStyle.paddingTop} ${buttonStyle.paddingRight} ${buttonStyle.paddingBottom} ${buttonStyle.paddingLeft}`
                                }}
                            >
                                {sliderData.buttonText}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Feature Media */}
                <div
                    className="relative"
                    style={{
                        ...getWidthStyle(layoutStyle.rightWidth),
                        minHeight: '300px',
                        height: '100%',
                        boxSizing: rightContentStyle.boxSizing,
                        margin: `${rightContentStyle.marginTop} ${rightContentStyle.marginRight} ${rightContentStyle.marginBottom} ${rightContentStyle.marginLeft}`,
                        padding: `${rightContentStyle.paddingTop} ${rightContentStyle.paddingRight} ${rightContentStyle.paddingBottom} ${rightContentStyle.paddingLeft}`
                    }}
                >
                    {sliderData.featureMedia && (
                        <div className="absolute inset-0">
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(sliderData.featureMedia) ? (
                                shouldUseFillForFeature ? (
                                    <Image
                                        src={getImageUrl(sliderData.featureMedia)}
                                        alt="Feature"
                                        fill
                                        style={featureImageStyle}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Image
                                        src={getImageUrl(sliderData.featureMedia)}
                                        alt="Feature"
                                        width={parseInt(styles.featureImage?.width) || 800}
                                        height={parseInt(styles.featureImage?.height) || 600}
                                        style={featureImageWithDimensionsStyle}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )
                            ) : (
                                <video
                                    className="w-full h-full"
                                    style={featureImageWithDimensionsStyle}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                >
                                    <source src={sliderData.featureMedia} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SliderPreview;